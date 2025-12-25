import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function FilesPage() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <FileText className="w-8 h-8 text-primary" />
                    <CardTitle className="text-2xl font-bold">Files & Deliverables</CardTitle>
                </div>
                <CardDescription>
                    Access all your project files, drafts, and final deliverables.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This section is under construction. A file manager will be available here soon.</p>
            </CardContent>
        </Card>
    )
}
