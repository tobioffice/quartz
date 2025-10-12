type documentsType = {
    pageContent: string;
    metadata: {
        source: string;
    };
}[];
export declare const loadDocs: (filePath: string) => documentsType;
export {};
