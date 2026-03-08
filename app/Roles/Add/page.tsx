import { Suspense } from "react";
import RolesAdd from "../../../containers/Roles/Add";
import Layout from "@/containers/Layout";

export default function Add() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Layout>
        <RolesAdd />
      </Layout>
    </Suspense>
  );
}
