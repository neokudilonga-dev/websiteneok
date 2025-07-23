
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
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
import { readingPlan, schools } from "@/lib/data";

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

    const readingPlanProductIdsInCart = useMemo(() => {
        const readingPlanProductIds = new Set(readingPlan.map(item => item.productId));
        return cartItems.filter(item => readingPlanProductIds.has(item.id));
    }, [cartItems]);

    const requiresStudentInfo = readingPlanProductIdsInCart.length > 0;
    
    const schoolsInCart = useMemo(() => {
        const schoolIds = new Set(readingPlanProductIdsInCart.map(item => {
            const rpItem = readingPlan.find(rp => rp.productId === item.id);
            return rpItem?.schoolId;
        }).filter(Boolean));

        return schools.filter(school => schoolIds.has(school.id));
    }, [readingPlanProductIdsInCart]);

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
        message: "O nome do aluno e a classe são obrigatórios para itens do plano de leitura.",
        path: ["studentName"], // You can choose which field to show the error on
    }).refine(data => {
        if (data.deliveryOption !== 'levantamento' && data.deliveryOption !== 'levantamento-local' && !data.deliveryAddress) {
            return false;
        }
        return true;
    }, {
        message: "A morada é obrigatória para entrega ao domicílio.",
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
        let prefix = "LIV";
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
                title: "Carrinho Vazio",
                description: "Não pode fazer uma encomenda com o carrinho vazio.",
                variant: "destructive"
            });
            return;
        }

        const orderReference = generateOrderReference();
        
        // In a real app, you would send this data to your backend API
        const orderData = {
            ...data,
            items: cartItems,
            total: finalTotal,
            deliveryFee,
            reference: orderReference,
            date: new Date().toISOString(),
            status: "pending",
        };
        console.log("Order Submitted:", orderData);

        // For demo purposes, we clear the cart and redirect.
        clearCart();
        router.push(`/order-confirmation?ref=${orderReference}`);

        toast({
            title: "Encomenda Submetida!",
            description: "A sua encomenda foi enviada com sucesso."
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4 rounded-lg border bg-card p-6">
                     <h3 className="text-xl font-semibold">Detalhes de Contacto</h3>
                     { requiresStudentInfo && (
                        <>
                             <FormField
                                control={form.control}
                                name="studentName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome da/o Aluna/o</FormLabel>
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
                                        <FormLabel>Classe e Turma</FormLabel>
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
                                <FormLabel>Nome do/a Responsável pela Encomenda</FormLabel>
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
                                <FormLabel>Número Telefónico de Contacto</FormLabel>
                                <FormControl><Input {...field} placeholder="Com WhatsApp activo" /></FormControl>
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
                    <h3 className="text-xl font-semibold">Opções de Entrega</h3>
                    <FormField
                        control={form.control}
                        name="deliveryOption"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="tala-morro" /></FormControl>
                                            <FormLabel className="font-normal">Sim - em Talatona e Morro Bento (distrito urbano) - acresce 2000 AKZ</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="fora-tala" /></FormControl>
                                            <FormLabel className="font-normal">Sim - fora de Talatona - acresce 2500 AKZ</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="outras" /></FormControl>
                                            <FormLabel className="font-normal">Sim - fora das Zonas acima referidas - acresce 4000 AKZ</FormLabel>
                                        </FormItem>
                                        {allowPickupAtSchool && (
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl><RadioGroupItem value="levantamento" /></FormControl>
                                                <FormLabel className="font-normal">Não - levantamento no Colégio em data a confirmar</FormLabel>
                                            </FormItem>
                                        )}
                                        {allowPickupAtLocation && (
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl><RadioGroupItem value="levantamento-local" /></FormControl>
                                                <FormLabel className="font-normal">Não - levantamento no Condomínio BCI 6 Casas, Casa No. 6 (Sujeito a marcação prévia)</FormLabel>
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
                                    <FormLabel>Morada (se optou por entrega domiciliária)</FormLabel>
                                    <FormControl><Textarea {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                 <div className="space-y-4 rounded-lg border bg-card p-6">
                    <h3 className="text-xl font-semibold">Forma de Pagamento</h3>
                     <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="numerario" /></FormControl>
                                            <FormLabel className="font-normal">Pagamento em numerário</FormLabel>
                                        </FormItem>
                                        { (deliveryOption === 'levantamento' || deliveryOption === 'levantamento-local') && (
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl><RadioGroupItem value="multicaixa" /></FormControl>
                                                <FormLabel className="font-normal">Pagamento com Multicaixa (não disponível para entregas)</FormLabel>
                                            </FormItem>
                                        )}
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="transferencia" /></FormControl>
                                            <FormLabel className="font-normal">Pagamento por transferência bancária ou depósito</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" size="lg" className="w-full">
                    Enviar Encomenda e Pagar {finalTotal.toLocaleString("pt-PT", { style: "currency", currency: "AOA" })}
                </Button>
            </form>
        </Form>
    );
}
