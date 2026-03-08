import { Suspense } from "react";
import AcceptInvite from "../../containers/Auth/acceptInvite";

export default function List() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AcceptInvite />
    </Suspense>
  );
}
