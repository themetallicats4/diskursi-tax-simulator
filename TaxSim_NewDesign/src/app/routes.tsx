import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import ProfessionStep from "./components/ProfessionStep";
import IncomeStep from "./components/IncomeStep";
import DirectTaxStep from "./components/DirectTaxStep";
import LifestyleStep from "./components/LifestyleStep";
import IndirectTaxStep from "./components/IndirectTaxStep";
import ResultsStep from "./components/ResultsStep";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: ProfessionStep },
      { path: "gelir", Component: IncomeStep },
      { path: "dogrudan", Component: DirectTaxStep },
      { path: "yasam", Component: LifestyleStep },
      { path: "dolayli", Component: IndirectTaxStep },
      { path: "toplam", Component: ResultsStep },
    ],
  },
]);
