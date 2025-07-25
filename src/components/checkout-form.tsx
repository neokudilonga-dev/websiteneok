
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/context/data-context";
import { useLanguage } from "@/context/language-context";

const checkoutSchema = z.object({
  studentName: z.string().optional(),
  classAndGrade: z.string().optional(),
  phone: z.string().min(9, "O número de telefone é obrigatório."),
  guardianName: z.string().min(1, "O nome do responsável é obrigatório."),
  email: z.string().email("Por favor, insira um email válido."),
  deliveryOption: z.enum([
    "tala-morro",
    "fora-tala",
    "outras",
    "levantamento",
    "levantamento-local",
  ]),
  deliveryAddress: z.string().optional(),
  paymentMethod: z.enum(["numerario", "multicaixa", "transferencia"]),
});


export default function CheckoutForm() {
    const router = useRouter();
    const { toast } = useToast();
    const { cartItems, cartTotal, clearCart } = useCart();
    const { readingPlan, schools } = useData();
    const { t, language } = useLanguage();

    const readingPlanProductIdsInCart = useMemo(() => {
        const readingPlanProductIds = new Set(readingPlan.map(item => item.productId));
        return cartItems.filter(item => readingPlanProductIds.has(item.id));
    }, [cartItems, readingPlan]);

    const requiresStudentInfo = readingPlanProductIdsInCart.length > 0;
    
    const schoolsInCart = useMemo(() => {
        const schoolIdsInCart = new Set(readingPlan.filter(rp => readingPlanProductIdsInCart.some(ci => ci.id === rp.productId)).map(rp => rp.schoolId));
        return schools.filter(school => schoolIdsInCart.has(school.id));
    }, [readingPlanProductIdsInCart, schools]);

    const allowPickupAtSchool = useMemo(() => {
        return requiresStudentInfo && schoolsInCart.some(school => school.allowPickup);
    }, [requiresStudentInfo, schoolsInCart]);

    const allowPickupAtLocation = useMemo(() => {
        return schoolsInCart.some(school => school.allowPickupAtLocation);
    }, [schoolsInCart]);


    const conditionalCheckoutSchema = checkoutSchema.refine(data => {
        if (requiresStudentInfo) {
            return !!data.studentName && !!data.classAndGrade;
        }
        return true;
    }, {
        message: t('checkout_form.errors.student_info_required'),
        path: ["studentName"], // You can choose which field to show the error on
    }).refine(data => {
        if (data.deliveryOption !== 'levantamento' && data.deliveryOption !== 'levantamento-local' && !data.deliveryAddress) {
            return false;
        }
        return true;
    }, {
        message: t('checkout_form.errors.address_required'),
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
            deliveryOption: "tala-morro",
            deliveryAddress: "",
            paymentMethod: "numerario",
        },
    });

    const deliveryOption = form.watch("deliveryOption");
    const paymentMethod = form.watch("paymentMethod");

    const getDeliveryFee = () => {
        switch (deliveryOption) {
            case "tala-morro": return 2000;
            case "fora-tala": return 2500;
            case "outras": return 4000;
            default: return 0;
        }
    };

    const deliveryFee = getDeliveryFee();
    const finalTotal = cartTotal + deliveryFee;

    const generateOrderReference = () => {
        let prefix = "LIV"; // Default prefix
        if (schoolsInCart.length > 0) {
            const school = schools.find(s => s.id === schoolsInCart[0].id);
            if (school) {
                prefix = school.abbreviation;
            }
        }
        return `${prefix}-${new Date().getFullYear()}${(Math.random() * 90000 + 10000).toFixed(0)}`;
    }

    const onSubmit = (data: CheckoutFormValues) => {
        if(cartItems.length === 0){
            toast({
                title: t('checkout_form.toast.cart_empty_title'),
                description: t('checkout_form.toast.cart_empty_description'),
                variant: "destructive"
            });
            return;
        }

        const orderReference = generateOrderReference();
        const schoolInCart = schoolsInCart.length > 0 ? schoolsInCart[0] : undefined;
        const schoolName = schoolInCart ? (schoolInCart.name[language] || schoolInCart.name.pt) : undefined;
        
        // In a real app, you would send this data to your backend API
        const orderData = {
            ...data,
            items: cartItems,
            total: finalTotal,
            deliveryFee,
            reference: orderReference,
            date: new Date().toISOString(),
            status: "pending",
            schoolId: schoolInCart?.id,
            schoolName: schoolName
        };
        console.log("Order Submitted:", orderData);

        // For demo purposes, we clear the cart and redirect.
        clearCart();
        const urlParams = new URLSearchParams();
        urlParams.set("ref", orderReference);
        urlParams.set("payment", data.paymentMethod);
        router.push(`/order-confirmation?${urlParams.toString()}`);

        toast({
            title: t('checkout_form.toast.order_submitted_title'),
            description: t('checkout_form.toast.order_submitted_description')
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4 rounded-lg border bg-card p-6">
                     <h3 className="text-xl font-semibold">{t('checkout_form.contact_details')}</h3>
                     { requiresStudentInfo && (
                        <>
                             <FormField
                                control={form.control}
                                name="studentName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('checkout_form.student_name')}</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="classAndGrade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('checkout_form.class_and_grade')}</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                     )}
                     <FormField
                        control={form.control}
                        name="guardianName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('checkout_form.guardian_name')}</FormLabel>
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
                                <FormLabel>{t('checkout_form.phone')}</FormLabel>
                                <FormControl><Input {...field} placeholder={t('checkout_form.phone_placeholder')} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl><Input type="email" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4 rounded-lg border bg-card p-6">
                    <h3 className="text-xl font-semibold">{t('checkout_form.delivery_options')}</h3>
                    <FormField
                        control={form.control}
                        name="deliveryOption"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="tala-morro" /></FormControl>
                                            <FormLabel className="font-normal">{t('checkout_form.delivery_option_1')}</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="fora-tala" /></FormControl>
                                            <FormLabel className="font-normal">{t('checkout_form.delivery_option_2')}</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="outras" /></FormControl>
                                            <FormLabel className="font-normal">{t('checkout_form.delivery_option_3')}</FormLabel>
                                        </FormItem>
                                        {allowPickupAtSchool && (
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl><RadioGroupItem value="levantamento" /></FormControl>
                                                <FormLabel className="font-normal">{t('checkout_form.delivery_option_4')}</FormLabel>
                                            </FormItem>
                                        )}
                                        {allowPickupAtLocation && (
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl><RadioGroupItem value="levantamento-local" /></FormControl>
                                                <FormLabel className="font-normal">{t('checkout_form.delivery_option_5')}</FormLabel>
                                            </FormItem>
                                        )}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {deliveryOption !== 'levantamento' && deliveryOption !== 'levantamento-local' && (
                         <FormField
                            control={form.control}
                            name="deliveryAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('checkout_form.delivery_address')}</FormLabel>
                                    <FormControl><Textarea {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                 <div className="space-y-4 rounded-lg border bg-card p-6">
                    <h3 className="text-xl font-semibold">{t('checkout_form.payment_method')}</h3>
                     <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="numerario" /></FormControl>
                                            <FormLabel className="font-normal">{t('checkout_form.payment_method_1')}</FormLabel>
                                        </FormItem>
                                        { (deliveryOption === 'levantamento' || deliveryOption === 'levantamento-local') && (
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl><RadioGroupItem value="multicaixa" /></FormControl>
                                                <FormLabel className="font-normal">{t('checkout_form.payment_method_2')}</FormLabel>
                                            </FormItem>
                                        )}
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="transferencia" /></FormControl>
                                            <FormLabel className="font-normal">{t('checkout_form.payment_method_3')}</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" size="lg" className="w-full">
                    {t('checkout_form.submit_button')} {finalTotal.toLocaleString("pt-PT", { style: "currency", currency: "AOA", minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Button>
            </form>
        </Form>
    );
}
