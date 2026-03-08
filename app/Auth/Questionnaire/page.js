import { Suspense } from "react";
import Questionnaire from "../../../containers/Auth/Questionnaire";

export default function QuestionnaireList() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Questionnaire />
    </Suspense>
  );
}
