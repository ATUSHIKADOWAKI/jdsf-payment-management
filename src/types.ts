
export type Expense = {
    date: string;
    vendor: string;
    description: string;
    category: string;
    subcategory: string;
    amount: string;
    currency: string;
    receipt: string | null;
    fileName: string | null;
  };
  
  export type Settlement = {
    id: string;
    status: string;
    projectName: string;
    startDate: string;
    endDate: string;
    submittedAt: { seconds: number };
    expenses: Expense[];
    applicantName: string;
    isEditable: boolean;
  };
  