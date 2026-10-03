import { CartProvider } from "./menu/contexts/cart";

interface RestaurantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

const RestaurantLayout = async ({
  children,
  params,
}: RestaurantLayoutProps) => {
  const { slug } = await params;
  return (
    <CartProvider key={slug} storageKey={`cart:${slug}`}>
      {children}
    </CartProvider>
  );
};

export default RestaurantLayout;
