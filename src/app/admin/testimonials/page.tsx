import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TestimonialApprovalForm } from "@/app/admin/testimonial-approval-form";
import { MessageSquareQuote } from "lucide-react";

export default function TestimonialsAdminPage() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
             <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <MessageSquareQuote className="w-8 h-8 text-primary" />
                        <div>
                            <CardTitle className="text-2xl font-bold">Testimonial Approval</CardTitle>
                            <CardDescription>
                                Use AI to review and approve new client testimonials before they go live.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <TestimonialApprovalForm />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Published Testimonials</CardTitle>
                    <CardDescription>A list of all testimonials currently live on the website.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-96 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>Live testimonials list will be here.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
