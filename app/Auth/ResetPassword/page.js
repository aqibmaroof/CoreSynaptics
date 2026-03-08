import { Suspense } from "react";
import ResetPassword from "../../../containers/Auth/ResetPassword";

export default function List() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPassword />
    </Suspense>
  );
}
