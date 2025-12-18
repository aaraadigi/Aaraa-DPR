
import React from 'react';
import { Check, Clock, AlertCircle, Truck, CreditCard, ShieldCheck } from 'lucide-react';
import { IndentStatus } from '../types';

interface IndentStatusTrackerProps {
  status: IndentStatus;
}

export const IndentStatusTracker: React.FC<IndentStatusTrackerProps> = ({ status }) => {
  const steps = [
    { id: '1', label: 'Raised', match: ['Raised_By_SE', 'PM_Review', 'QS_Analysis', 'Procurement_Quoting', 'Ops_Approval', 'MD_Final_Approval', 'Finance_Payment_Pending', 'Procurement_Dispatch', 'GRN_Pending', 'Completed'] },
    { id: '2', label: 'PM Review', match: ['PM_Review', 'QS_Analysis', 'Procurement_Quoting', 'Ops_Approval', 'MD_Final_Approval', 'Finance_Payment_Pending', 'Procurement_Dispatch', 'GRN_Pending', 'Completed'] },
    { id: '3', label: 'QS Analysis', match: ['QS_Analysis', 'Procurement_Quoting', 'Ops_Approval', 'MD_Final_Approval', 'Finance_Payment_Pending', 'Procurement_Dispatch', 'GRN_Pending', 'Completed'] },
    { id: '4', label: 'Quoting', match: ['Procurement_Quoting', 'Ops_Approval', 'MD_Final_Approval', 'Finance_Payment_Pending', 'Procurement_Dispatch', 'GRN_Pending', 'Completed'] },
    { id: '5', label: 'Ops Head', match: ['Ops_Approval', 'MD_Final_Approval', 'Finance_Payment_Pending', 'Procurement_Dispatch', 'GRN_Pending', 'Completed'] },
    { id: '6', label: 'MD Final', match: ['MD_Final_Approval', 'Finance_Payment_Pending', 'Procurement_Dispatch', 'GRN_Pending', 'Completed'] },
    { id: '7', label: 'Finance', match: ['Finance_Payment_Pending', 'Procurement_Dispatch', 'GRN_Pending', 'Completed'] },
    { id: '8', label: 'On Way', match: ['Procurement_Dispatch', 'GRN_Pending', 'Completed'] },
    { id: '9', label: 'GRN', match: ['GRN_Pending', 'Completed'] },
    { id: '10', label: 'Done', match: ['Completed'] },
  ];

  const getStepStatus = (stepMatch: string[]) => {
    if (status === 'Rejected_By_PM' || status === 'Returned_To_SE') return 'error';
    if (stepMatch.includes(status)) return 'complete';
    
    const currentIndex = steps.findIndex(s => s.match.includes(status));
    const stepIndex = steps.findIndex(s => s.match === stepMatch);
    if (stepIndex === currentIndex) return 'active';
    
    return 'pending';
  };

  return (
    <div className="w-full py-6 px-4">
      <div className="relative flex justify-between">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
        
        {steps.map((step, idx) => {
          const stepStatus = getStepStatus(step.match);
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 border-2 text-[8px] font-bold
                ${stepStatus === 'complete' ? 'bg-green-500 border-green-500 text-white' : 
                  stepStatus === 'active' ? 'bg-white border-blue-500 text-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]' : 
                  stepStatus === 'error' ? 'bg-red-500 border-red-500 text-white' :
                  'bg-white border-slate-200 text-slate-300'}
              `}>
                {stepStatus === 'complete' ? <Check size={10} /> : idx + 1}
              </div>
              <span className={`
                absolute -bottom-5 text-[7px] font-bold uppercase tracking-tight whitespace-nowrap
                ${stepStatus === 'active' ? 'text-blue-600' : 'text-slate-400'}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
