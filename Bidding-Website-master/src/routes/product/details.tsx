import React from "react";
import type { MetaFunction, LoaderFunction } from "react-router-dom";
import { useLoaderData } from "react-router-dom";
import { Layout } from "../../components/common/layout/Layout";
import { ProductsDetailsPage } from "../../screens/product/ProductsDetailsPage";

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `Product Details - Horn of Antiques` },
    { 
      name: "description", 
      content: `View detailed information about this antique item and place your bid on Horn of Antiques.` 
    },
  ];
};

// Loader function to pre-fetch product data (optional)
export const loader: LoaderFunction = async ({ params }) => {
  // In a real implementation, you might want to fetch product data here
  // For now, we'll let the component handle the data fetching
  return { productId: params.id };
};

export default function ProductDetailsPage() {
  const { productId } = useLoaderData() as { productId: string };
  
  return (
    <Layout>
      <ProductsDetailsPage />
    </Layout>
  );
}
