'use client';

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const TermsPage = () => {
    const [terms, setTerms] = useState<{ title: string; content: string } | null>(null);

    useEffect(() => {
        fetch("https://cognifatigue.vercel.app/terms") // Updated API endpoint
            .then((response) => response.json())
            .then((data) => setTerms(data))
            .catch((error) => console.error("Error fetching terms:", error));
    }, []);

    if (!terms) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Card>
                <CardContent className="pt-6">
                    <h1 className="text-2xl font-bold mb-6">{terms.title}</h1>
                    <p>{terms.content}</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default TermsPage;