import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import { useCart } from "@/context/cart-context";
import { useData } from "@/context/data-context";
import { useLanguage } from "@/context/language-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CartItem, ReadingPlanItem, School } from "@/lib/types";
import { cn, getDisplayName } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const checkoutSchema = z.object({
  studentName: z.string().optional(),
  classAndGrade: z.string().optional(),
  phone: z.string().min(9, "O número de telefone é obrigatório."),
  guardianName: z.string().min(1, "O nome do responsável é obrigatório."),
  email: z.string().email("Por favor, insira um email válido.").optional().or(z.literal("")),
  deliveryOption: z.enum([
    "delivery",
    "pickup",
    "outside-zones",
    "levantamento",
    "levantamento-local",
  ]),
  deliveryAddress: z.string().optional(),
  preferredDeliveryTime: z.enum([
    "10:00-12:00",
    "14:30-16:30",
  ]).optional(),
  paymentMethod: z.enum(["transferencia", "numerario", "multicaixa"], {
    required_error: "Método de pagamento é obrigatório.",
  }),
});

export default function CheckoutForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { readingPlan, schools, submitOrder, loading, deliverySettings, getDeliverySettings } = useData();
  const { language } = useLanguage();

  const readingPlanProductIds = useMemo(() => {
    return new Set(readingPlan.map((item: ReadingPlanItem) => item.productId));
  }, [readingPlan]);

  const isSchoolOrder = useMemo(() => {
    return cartItems.some((item: CartItem) => item.kitId !== undefined) || cartItems.some((item: CartItem) => item.id && readingPlanProductIds.has(item.id));
  }, [cartItems, readingPlanProductIds]);

  const schoolsInCart = useMemo(() => {
    const schoolIdsInCart = new Set(readingPlan.filter((rp: ReadingPlanItem) => cartItems.some((ci: CartItem) => ci.id === rp.productId)).map((rp: ReadingPlanItem) => rp.schoolId));
    return schools.filter((school: School) => schoolIdsInCart.has(school.id));
  }, [cartItems, schools, readingPlan]);

  const allowPickupAtSchool = useMemo(() => {
    return isSchoolOrder && schoolsInCart.some((school: School) => school.allowPickup);
  }, [isSchoolOrder, schoolsInCart]);

  const allowPickupAtLocation = useMemo(() => {
    return schoolsInCart.some((school: School) => school.allowPickupAtLocation);
  }, [schoolsInCart]);

  const conditionalCheckoutSchema = checkoutSchema.refine((data) => {
    if (isSchoolOrder) {
      return !!data.studentName;
    }
    return true;
  }, {
    message: t("checkout_form.errors.student_name_required"),
    path: ["studentName"],
  }).refine((data) => {
    if (isSchoolOrder && data.deliveryOption === "levantamento") {
      return !!data.classAndGrade;
    }
    return true;
  }, {
    message: t("checkout_form.errors.class_and_grade_required"),
    path: ["classAndGrade"],
  }).refine((data) => {
    if ((data.deliveryOption === "delivery" || data.deliveryOption === "pickup" || data.deliveryOption === "outside-zones") && !data.deliveryAddress) {
      return false;
    }
    return true;
  }, {
    message: t("checkout_form.errors.address_required"),
    path: ["deliveryAddress"],
  });

  type CheckoutFormValues = z.infer<typeof conditionalCheckoutSchema>;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(conditionalCheckoutSchema),
    defaultValues: {
      studentName: "",
      classAndGrade: "",
      phone: "",
      guardianName: "",
      email: "",
      deliveryOption: "delivery",
      deliveryAddress: "",
      preferredDeliveryTime: undefined,
      paymentMethod: "transferencia",
    },
  });

  const deliveryOption = form.watch("deliveryOption");
  const paymentMethod = form.watch("paymentMethod");

  useEffect(() => {
    if ((deliveryOption === "delivery" || deliveryOption === "pickup" || deliveryOption === "outside-zones") && paymentMethod === "multicaixa") {
      form.setValue("paymentMethod", "transferencia");
    }
  }, [deliveryOption, paymentMethod, form]);

  // Load delivery settings on mount
  useEffect(() => {
    getDeliverySettings();
  }, [getDeliverySettings]);

  const getDeliveryFee = () => {
    // Default fees if settings not loaded
    const defaultFees = {
      feeTalatona: 2000,
      feeOutsideTalatona: 2500,
      feeOutsideZones: 4000,
      exemptionTalatona: 70000,
      exemptionOutsideTalatona: 80000,
    };
    
    const settings = deliverySettings ?? defaultFees;
    
    switch (deliveryOption) {
      case "delivery": {
        // Talatona/Morro Bento - check exemption
        const fee = settings.feeTalatona ?? 2000;
        const exemption = settings.exemptionTalatona ?? 70000;
        if (exemption > 0 && cartTotal >= exemption) {
          return 0; // Exempt
        }
        return fee;
      }
      case "pickup": {
        // Fora de Talatona - check exemption
        const fee = settings.feeOutsideTalatona ?? 2500;
        const exemption = settings.exemptionOutsideTalatona ?? 80000;
        if (exemption > 0 && cartTotal >= exemption) {
          return 0; // Exempt
        }
        return fee;
      }
      case "outside-zones": {
        // Viana/Kilamba - check exemption (same threshold as outside Talatona)
        const fee = settings.feeOutsideZones ?? 4000;
        const exemption = settings.exemptionOutsideTalatona ?? 80000;
        if (exemption > 0 && cartTotal >= exemption) {
          return 0; // Exempt
        }
        return fee;
      }
      case "levantamento":
        return 0; // Pickup at school - always free
      case "levantamento-local":
        return 0; // Pickup at location - always free
      default:
        return 0;
    }
  };

  const deliveryFee = getDeliveryFee();
  const finalTotal = cartTotal + deliveryFee;

  const generateOrderReference = () => {
    let prefix = "LIV"; // Default prefix
    if (schoolsInCart.length > 0) {
      const school = schools.find((s: School) => s.id === schoolsInCart[0].id);
      if (school) {
        prefix = school.abbreviation;
      }
    }
    // Short format: PREFIX-XXXX (4 digit random number)
    return `${prefix}-${Math.floor(Math.random() * 9000 + 1000)}`;
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      toast({
        title: t("checkout_form.toast.cart_empty_title"),
        description: t("checkout_form.toast.cart_empty_description"),
        variant: "destructive"
      });
      return;
    }

    const orderReference = generateOrderReference();
    const schoolInCart = schoolsInCart.length > 0 ? schoolsInCart[0] : undefined;
    const schoolName = schoolInCart ? (getDisplayName(schoolInCart.name, language) || null) : null;

    try {
      await submitOrder({
        ...data,
        email: data.email || null,
        paymentMethod: data.paymentMethod, // Use the selected payment method
        deliveryAddress: (data.deliveryOption === "delivery" || data.deliveryOption === "pickup" || data.deliveryOption === "outside-zones") ? (data.deliveryAddress ?? "") : null,
        preferredDeliveryTime: (data.deliveryOption === "delivery" || data.deliveryOption === "pickup" || data.deliveryOption === "outside-zones") ? (data.preferredDeliveryTime ?? null) : null,
        items: cartItems,
        total: finalTotal,
        deliveryFee,
        reference: orderReference,
        date: new Date().toISOString(),
        schoolId: schoolInCart?.id,
        schoolName: schoolName ?? undefined,
        studentName: isSchoolOrder ? data.studentName : undefined,
        studentClass: (isSchoolOrder && data.deliveryOption === "levantamento") ? (data.classAndGrade ?? undefined) : undefined,
        language, // Add language to order
      });

      clearCart();
      
      toast({
        title: t("checkout_form.toast.order_submitted_title"),
        description: t("checkout_form.toast.order_submitted_description")
      });

      const urlParams = new URLSearchParams();
      urlParams.set("ref", orderReference);
      urlParams.set("payment", data.paymentMethod);
      router.push(`/order-confirmation?${urlParams.toString()}`);

    } catch (error) {
      console.error("Failed to submit order:", error);
      toast({
        title: t("checkout_form.toast.order_submission_failed_title"),
        description: t("checkout_form.toast.order_submission_failed_description"),
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4 rounded-lg border bg-card p-6">
          <h3 className="text-xl font-semibold">{t("checkout_form.contact_details")}</h3>
          {isSchoolOrder && (
            <>
              <FormField
                control={form.control}
                name="studentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("checkout_form.student_name")}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {deliveryOption === "levantamento" && (
                <FormField
                  control={form.control}
                  name="classAndGrade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("checkout_form.class_and_grade")}</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </>
          )}
          <FormField
            control={form.control}
            name="guardianName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("checkout_form.guardian_name")}</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("checkout_form.phone")} (Com WhatsApp Activo)</FormLabel>
                <FormControl><Input {...field} placeholder={t("checkout_form.phone_placeholder")} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (sem email não receberá comprovativo da efectivação da encomenda)</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 rounded-lg border bg-card p-6">
          <h3 className="text-xl font-semibold">{t("checkout_form.delivery_options")}</h3>
          <FormField
            control={form.control}
            name="deliveryOption"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="delivery" /></FormControl>
                      <FormLabel className="font-normal">{t("checkout_form.delivery_option_1")}</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="pickup" /></FormControl>
                      <FormLabel className="font-normal">{t("checkout_form.delivery_option_2")}</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="outside-zones" /></FormControl>
                      <FormLabel className="font-normal">{t("checkout_form.delivery_option_3")}</FormLabel>
                    </FormItem>
                    {allowPickupAtSchool && (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="levantamento" /></FormControl>
                        <FormLabel className="font-normal">{t("checkout_form.delivery_option_4")}</FormLabel>
                      </FormItem>
                    )}
                    {allowPickupAtLocation && (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="levantamento-local" /></FormControl>
                        <FormLabel className="font-normal">{t("checkout_form.delivery_option_5")}</FormLabel>
                      </FormItem>
                    )}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {(deliveryOption === "delivery" || deliveryOption === "pickup" || deliveryOption === "outside-zones") && (
            <>
              <FormField
                control={form.control}
                name="deliveryAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("checkout_form.delivery_address")}</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredDeliveryTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("checkout_form.preferred_delivery_time")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full sm:w-[240px]">
                          <SelectValue placeholder={t("checkout_form.preferred_delivery_time")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="10:00-12:00">10:00 - 12:00</SelectItem>
                        <SelectItem value="14:30-16:30">14:30 - 16:30</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <div className="space-y-4 rounded-lg border bg-card p-6">
          <h3 className="text-xl font-semibold">{t("checkout_form.payment_method")}</h3>
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="transferencia" /></FormControl>
                      <FormLabel className="font-normal">{t("checkout_form.payment_method_transferencia")}</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="numerario" /></FormControl>
                      <FormLabel className="font-normal">{t("checkout_form.payment_method_numerario")}</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem 
                          value="multicaixa" 
                          disabled={deliveryOption === "delivery" || deliveryOption === "pickup" || deliveryOption === "outside-zones"}
                        />
                      </FormControl>
                      <FormLabel className={cn(
                        "font-normal",
                        (deliveryOption === "delivery" || deliveryOption === "pickup" || deliveryOption === "outside-zones") && "text-muted-foreground line-through"
                      )}>
                        {t("checkout_form.payment_method_multicaixa")}
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        <div className="mt-6 space-y-1 text-right">
          <p className="text-muted-foreground">{t("checkout_form.cart_total")}: {cartTotal.toLocaleString('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Kz</p>
          <p className="text-muted-foreground">{t("checkout_form.delivery_fee")}: {deliveryFee.toLocaleString('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Kz</p>
          <p className="text-2xl font-bold text-primary">{t("checkout_form.total")}: {finalTotal.toLocaleString('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Kz</p>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {t("common.loading") || "Processando..."}
            </span>
          ) : (
            `${t("checkout_form.submit_button")} ${finalTotal.toLocaleString("pt-PT", { style: "currency", currency: "AOA", minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
          )}
        </Button>
      </form>
    </Form>
  );
}
