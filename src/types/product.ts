export type Size = "XXS" | "XS" | "S" | "M" | "L" | "XL";

export type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  images: string[];
  sizes: Size[];
  inStock: boolean;
};
