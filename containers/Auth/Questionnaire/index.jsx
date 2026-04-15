"use client";
import { useState } from "react";
import AdvanceReporting from "./AdvanceReporting";
import UsersQuestion from "./Users";
import Storage from "./Storage";
import NeedSales from "./NeedSales";
import ProjectsQuestions from "./Projects";
import Modules from "./Modules";
import { useSearchParams } from "next/navigation";

const LoginPage = () => {
  const searchParams = useSearchParams();
  const currentStep = searchParams.get("step");
  const [step, setStep] = useState(currentStep || 1);

  return (
    <>
      {step === 1 ? (
        <UsersQuestion step={step} setStep={setStep} />
      ) : step === 2 ? (
        <Storage step={step} setStep={setStep} />
      ) : step === 3 ? (
        <NeedSales step={step} setStep={setStep} />
      ) : step === 4 ? (
        <ProjectsQuestions step={step} setStep={setStep} />
      ) : step === 5 ? (
        <AdvanceReporting step={step} setStep={setStep} />
      ) : (
        <Modules step={step} setStep={setStep} />
      )}
    </>
  );
};

export default LoginPage;
