import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban } from "lucide-react";

export default function MyProjectsPage() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <FolderKanban className="w-8 h-8 text-primary" />
                    <CardTitle className="text-2xl font-bold">My Projects</CardTitle>
                </div>
                <CardDescription>
                    All your current and past projects are listed here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This section is under construction. Project details will be displayed here soon.</p>
            </CardContent>
        </Card>
    )
}
