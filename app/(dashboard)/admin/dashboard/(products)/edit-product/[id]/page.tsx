"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X } from "lucide-react";
import dynamic from "next/dynamic";
import {
  useGetCategoriesQuery,
  useGetSubcategoriesQuery,
  useGetSubSubcategoriesQuery,
} from "@/app/redux/features/category-subcategory/category-subcategory.api";
import { useGetBrandsQuery } from "@/app/redux/features/brand/brand.api";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from "@/app/redux/features/product/product.api";
import {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import { toast } from "sonner";

// Dynamically import Tiptap to avoid SSR issues
const TiptapEditor = dynamic(() => import("@/components/ui/tiptap-editor"), {
  ssr: false,
});

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Tech attribute types for dropdown
const TECH_ATTRIBUTE_TYPES = [
  { value: "color", label: "Color" },
  { value: "storage", label: "Storage" },
  { value: "ram", label: "RAM" },
  { value: "screen_size", label: "Screen Size" },
  { value: "connectivity", label: "Connectivity" },
  { value: "compatibility", label: "Compatibility" },
  { value: "material", label: "Material" },
  { value: "capacity", label: "Capacity" },
  { value: "region", label: "Region" },
  { value: "network", label: "Network" },
  { value: "type", label: "Type" },
];

// Validation schemas for manual variant approach
const attributeValueSchema = z.object({
  label: z.string().min(1, "Label is required"),
  value: z.string().min(1, "Value is required"),
  colorCode: z.string().optional(),
  images: z.array(z.instanceof(File)).optional(),
  isDefault: z.boolean().optional(),
});

const attributeSchema = z.object({
  name: z.string().min(1, "Attribute name is required"),
  type: z.string().min(1, "Attribute type is required"),
  values: z
    .array(attributeValueSchema)
    .min(1, "At least one value is required"),
  isRequired: z.boolean().optional(),
  displayOrder: z.number().optional(),
});

const manualVariantSchema = z.object({
  color: z.string().optional(),
  storage: z.string().optional(),
  ram: z.string().optional(),
  region: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  stock: z.string().min(1, "Stock is required"),
  discount: z.string().optional(),
  discountedPrice: z.string().optional(),
});

const specificationSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  descriptionImage: z.instanceof(File).optional(),
  video: z.string().optional(),
  description: z.string().optional(),
  brand: z.string().min(1, "Brand is required"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "Sub Category is required"),
  subSubCategory: z.string().optional(),
  searchTags: z.string().optional(),
  // Allow products without attributes; variants can still be created with price and stock only
  attributes: z.array(attributeSchema).default([]),
  // Variants are optional if simple price/stock provided
  manualVariants: z.array(manualVariantSchema).default([]),
  // Allow products without specifications
  specifications: z.array(specificationSchema).default([]),
  // Optional gallery images to upload with the product
  galleryImages: z.array(z.instanceof(File)).optional().default([]),
  // Optional simple pricing (no attributes/variants)
  simplePrice: z.string().optional(),
  simpleStock: z.string().optional(),
  simpleDiscount: z.string().optional(),
  categoryAssignments: z.array(
    z.object({
      category: z.string().min(1, "Category is required"),
      subCategory: z.string().min(1, "Sub Category is required"),
      subSubCategory: z.string().optional(),
    })
  ).default([]),
});

type ProductFormData = z.infer<typeof productSchema>;

// TypeScript interfaces for product data from API
interface ProductAttribute {
  name?: string;
  type?: string;
  values?: Array<{
    label?: string;
    value?: string;
    colorCode?: string;
    images?: string[];
    isDefault?: boolean;
  }>;
  isRequired?: boolean;
  displayOrder?: number;
}

interface ProductVariant {
  finalPrice?: number;
  price?: number;
  stock?: number;
  discountPercentage?: number;
  discountedPrice?: number;
  attributeCombination?: Array<{
    attributeType?: string;
    attributeValue?: string;
  }>;
}

interface ProductSpecification {
  key?: string;
  value?: string;
}

interface CategoryAssignment {
  category?: string | { _id?: string };
  subCategory?: string | { _id?: string };
  subSubCategory?: string | { _id?: string };
}

interface ProductData {
  name?: string;
  price?: number;
  stock?: number;
  discountPercentage?: number;
  images?: string[];
  subCategory?: string | { _id?: string };
  subSubCategory?: string | { _id?: string };
  searchTags?: string[];
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
  categoryAssignments?: CategoryAssignment[];
  [key: string]: unknown;
}

interface Brand {
  id?: string;
  _id?: string;
  name?: string;
  brandName?: string;
}

interface Category {
  id?: string;
  _id?: string;
  name?: string;
  categoryName?: string;
}

interface Subcategory {
  id?: string;
  _id?: string;
  name?: string;
  subCategoryName?: string;
  category?: string | { id?: string; _id?: string; [key: string]: unknown };
  parentCategoryId?: string;
  [key: string]: unknown;
}

interface SubSubcategory {
  id?: string;
  _id?: string;
  name?: string;
  subcategory?: string | { id?: string; _id?: string; [key: string]: unknown };
  parentSubcategoryId?: string;
  [key: string]: unknown;
}

// TypeScript interfaces for component props
interface AttributeManagerProps {
  attrIndex: number;
  control: Control<ProductFormData>;
  register: UseFormRegister<ProductFormData>;
  watch: UseFormWatch<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  onRemove: () => void;
  canRemove: boolean;
  existingAttributes?: ProductAttribute[];
}

interface AttributeValueManagerProps {
  attrIndex: number;
  valueIndex: number;
  attributeType: string;
  control: Control<ProductFormData>;
  register: UseFormRegister<ProductFormData>;
  watch: UseFormWatch<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  onRemove: () => void;
  canRemove: boolean;
  existingImageUrls?: string[];
}

interface VariantCreatorProps {
  attributes: ProductFormData['attributes'];
  onAddVariant: (variant: ProductFormData['manualVariants'][number]) => void;
}

interface VariantListProps {
  variants: ProductFormData['manualVariants'];
  onEditVariant: (index: number, variant: ProductFormData['manualVariants'][number]) => void;
  onDeleteVariant: (index: number) => void;
  attributes: ProductFormData['attributes'];
}

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const { data: product, isLoading: isProductLoading } =
    useGetProductByIdQuery(productId);
  console.log("product", product);
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, dirtyFields, isDirty },
    watch,
    setValue,
    reset,
  } = useForm<ProductFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "",
      descriptionImage: undefined,
      video: "",
      description: JSON.stringify({
        type: "doc",
        content: []
      }),
      brand: "",
      category: "",
      subCategory: "",
      subSubCategory: "",
      searchTags: "",
      attributes: [],
      manualVariants: [],
      specifications: [],
      galleryImages: [],
      simplePrice: "",
      simpleStock: "",
      simpleDiscount: "",
      categoryAssignments: [],
    },
  });

  // Determine if there are any changes in the form (built-in)
  const isAnyDirty = isDirty;

  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute,
  } = useFieldArray({
    control,
    name: "attributes",
  });

  const {
    fields: manualVariantFields,
    append: appendManualVariant,
    remove: removeManualVariant,
    update: updateManualVariant,
  } = useFieldArray({
    control,
    name: "manualVariants",
  });

  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({
    control,
    name: "specifications",
  });

  const {
    fields: assignmentFields,
    append: appendAssignment,
    remove: removeAssignment,
  } = useFieldArray({
    control,
    name: "categoryAssignments",
  });

  // Load brands, categories, subcategories and sub-subcategories
  const { data: brandsResp, isFetching: isBrandsLoading } =
    useGetBrandsQuery(undefined);
  const { data: categoriesResp, isFetching: isCategoriesLoading } =
    useGetCategoriesQuery(undefined);
  const { data: subcategoriesResp, isFetching: isSubcategoriesLoading } =
    useGetSubcategoriesQuery(undefined);
  const { data: subSubcategoriesResp, isFetching: isSubSubcategoriesLoading } =
    useGetSubSubcategoriesQuery(undefined);

  // Ensure data is an array (transformResponse already extracts data, so responses should be the arrays)
  const brands: Brand[] = Array.isArray(brandsResp) ? brandsResp : [];
  const categories: Category[] = Array.isArray(categoriesResp) ? categoriesResp : [];
  const allSubcategories: Subcategory[] = Array.isArray(subcategoriesResp) ? subcategoriesResp : [];
  const allSubSubcategories: SubSubcategory[] = Array.isArray(subSubcategoriesResp) ? subSubcategoriesResp : [];

  // Watch selected category and subcategory to filter subcategories and sub-subcategories
  const selectedCategoryId = watch("category");
  const selectedSubCategoryId = watch("subCategory");

  const filteredSubcategories = React.useMemo(() => {
    if (!selectedCategoryId) return [];
    const categoryIdStr = String(selectedCategoryId);
    return allSubcategories.filter((sc: Subcategory) => {
      if (typeof sc.category === "string")
        return String(sc.category) === categoryIdStr;
      if (sc.category && typeof sc.category === "object") {
        const id = String(sc.category.id ?? sc.category._id ?? "");
        return id === categoryIdStr;
      }
      // fallback to potential parentId field
      return String(sc.parentCategoryId ?? "") === categoryIdStr;
    });
  }, [allSubcategories, selectedCategoryId]);

  const filteredSubSubcategories = React.useMemo(() => {
    if (!selectedSubCategoryId) return [];
    const subCategoryIdStr = String(selectedSubCategoryId);
    return allSubSubcategories.filter((ssc: SubSubcategory) => {
      if (typeof ssc.subcategory === "string")
        return String(ssc.subcategory) === subCategoryIdStr;
      if (ssc.subcategory && typeof ssc.subcategory === "object") {
        const id = String(ssc.subcategory.id ?? ssc.subcategory._id ?? "");
        return id === subCategoryIdStr;
      }
      // fallback to potential parentId field
      return String(ssc.parentSubcategoryId ?? "") === subCategoryIdStr;
    });
  }, [allSubSubcategories, selectedSubCategoryId]);

  // Clear dependent selects only when user changes values (avoid nuking prefilled)
  const prevCategoryRef = React.useRef<string | undefined>(undefined);
  const prevSubCategoryRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    const prev = prevCategoryRef.current;
    if (
      prev !== undefined &&
      selectedCategoryId &&
      selectedCategoryId !== prev
    ) {
      setValue("subCategory", "");
      setValue("subSubCategory", "");
    }
    prevCategoryRef.current = selectedCategoryId;
  }, [selectedCategoryId, setValue]);

  React.useEffect(() => {
    const prev = prevSubCategoryRef.current;
    if (
      prev !== undefined &&
      selectedSubCategoryId &&
      selectedSubCategoryId !== prev
    ) {
      setValue("subSubCategory", "");
    }
    prevSubCategoryRef.current = selectedSubCategoryId;
  }, [selectedSubCategoryId, setValue]);

  // Track if form has been initialized to prevent race conditions
  const formInitialized = React.useRef(false);

  // Load product data when component mounts - wait for categories to load first
  useEffect(() => {
    // Wait for all required data to be loaded before initializing form
    if (
      product &&
      !isBrandsLoading &&
      !isCategoriesLoading &&
      !isSubcategoriesLoading &&
      !isSubSubcategoriesLoading &&
      !formInitialized.current
    ) {
      console.log("Loading product data:", product);

      // Convert backend data to form format
      const productData = product as ProductData;
      const formData: ProductFormData = {
        name: productData.name || "",
        descriptionImage: undefined, // File uploads need to be handled separately
        video: (typeof productData.video === 'string' ? productData.video : '') || (productData as { video_url?: string }).video_url || "",
        description:
          (typeof productData.description === 'string' ? productData.description : '') || JSON.stringify({ type: "doc", content: [] }),
        brand: String(
          typeof productData.brand === 'object' && productData.brand !== null && '_id' in productData.brand
            ? productData.brand._id
            : typeof productData.brand === 'string'
            ? productData.brand
            : ''
        ),
        category: String(
          typeof productData.category === 'object' && productData.category !== null && '_id' in productData.category
            ? productData.category._id
            : typeof productData.category === 'string'
            ? productData.category
            : ''
        ),
        subCategory: productData.subCategory
          ? String(
              typeof productData.subCategory === 'object' && productData.subCategory !== null && '_id' in productData.subCategory
                ? productData.subCategory._id
                : typeof productData.subCategory === 'string'
                ? productData.subCategory
                : ''
            )
          : "",
        subSubCategory: productData.subSubCategory
          ? String(
              typeof productData.subSubCategory === 'object' && productData.subSubCategory !== null && '_id' in productData.subSubCategory
                ? productData.subSubCategory._id
                : typeof productData.subSubCategory === 'string'
                ? productData.subSubCategory
                : ''
            )
          : "",
        searchTags: (productData.searchTags as string[])?.join(", ") || "",
        attributes:
          productData.attributes?.map((attr: ProductAttribute) => ({
            name: attr.name || "",
            type: attr.type || "",
            values:
              attr.values?.map((val) => ({
                label: val.label || "",
                value: val.value || "",
                colorCode: val.colorCode || "",
                images: [], // We'll handle existing images separately
                isDefault: val.isDefault || false,
              })) || [],
            isRequired: attr.isRequired ?? true,
            displayOrder: attr.displayOrder || 0,
          })) || [],
        manualVariants:
          productData.variants?.map((variant: ProductVariant) => {
            const variantData: {
              price: string;
              stock: string;
              color?: string;
              storage?: string;
              ram?: string;
              region?: string;
              discount?: string;
              discountedPrice?: string;
            } = {
              price: (variant.finalPrice ?? variant.price ?? "").toString() || "",
              stock: variant.stock?.toString() || "",
              discount: (variant.discountPercentage ?? "").toString() || "",
              discountedPrice: (variant.discountedPrice ?? "").toString() || "",
            };

            // Map attribute combinations to variant fields
            variant.attributeCombination?.forEach((combo) => {
              if (combo.attributeType) {
                const key = combo.attributeType as 'color' | 'storage' | 'ram' | 'region';
                if (key === 'color' || key === 'storage' || key === 'ram' || key === 'region') {
                  variantData[key] = combo.attributeValue || "";
                }
              }
            });

            return variantData;
          }) || [],
        specifications:
          productData.specifications?.map((spec: ProductSpecification) => ({
            key: spec.key || "",
            value: spec.value || "",
          })) || [],
        galleryImages: [], // Existing gallery images will be shown separately
        simplePrice: productData.price?.toString() || "",
        simpleStock: productData.stock?.toString() || "",
        simpleDiscount: (productData.discountPercentage ?? "").toString() || "",
        categoryAssignments: productData.categoryAssignments?.map((assignment: CategoryAssignment) => ({
          category: String(
            typeof assignment.category === 'object' && assignment.category !== null && '_id' in assignment.category
              ? assignment.category._id
              : typeof assignment.category === 'string'
              ? assignment.category
              : ''
          ),
          subCategory: String(
            typeof assignment.subCategory === 'object' && assignment.subCategory !== null && '_id' in assignment.subCategory
              ? assignment.subCategory._id
              : typeof assignment.subCategory === 'string'
              ? assignment.subCategory
              : ''
          ),
          subSubCategory: assignment.subSubCategory
            ? String(
                typeof assignment.subSubCategory === 'object' && assignment.subSubCategory !== null && '_id' in assignment.subSubCategory
                  ? assignment.subSubCategory._id
                  : typeof assignment.subSubCategory === 'string'
                  ? assignment.subSubCategory
                  : ''
              )
            : "",
        })) || [],
      };

      reset(formData);
      formInitialized.current = true;
    }
  }, [
    product,
    isBrandsLoading,
    isCategoriesLoading,
    isSubcategoriesLoading,
    isSubSubcategoriesLoading,
    reset,
    setValue,
  ]);

  // Reset form initialization flag when product ID changes
  useEffect(() => {
    formInitialized.current = false;
  }, [productId]);

  // Ensure subcategory and sub-subcategory values are set after filtering completes
  useEffect(() => {
    if (!product || !formInitialized.current) return;
    
    const productData = product as ProductData;
    const prodSubCategory = productData.subCategory
      ? String(
          typeof productData.subCategory === 'object' && productData.subCategory !== null && '_id' in productData.subCategory
            ? productData.subCategory._id
            : typeof productData.subCategory === 'string'
            ? productData.subCategory
            : ''
        )
      : "";
    const prodSubSubCategory = productData.subSubCategory
      ? String(
          typeof productData.subSubCategory === 'object' && productData.subSubCategory !== null && '_id' in productData.subSubCategory
            ? productData.subSubCategory._id
            : typeof productData.subSubCategory === 'string'
            ? productData.subSubCategory
            : ''
        )
      : "";

    // Only set if filtered lists have items and value exists in the filtered list
    if (prodSubCategory && filteredSubcategories.length > 0) {
      interface SubCategory {
        id?: string;
        _id?: string;
      }
      const exists = filteredSubcategories.some(
        (sc: SubCategory) => String(sc.id ?? sc._id) === prodSubCategory
      );
      if (exists) {
        setValue("subCategory", prodSubCategory, { shouldValidate: false });
      }
    }

    if (prodSubSubCategory && filteredSubSubcategories.length > 0) {
      interface SubSubCategory {
        id?: string;
        _id?: string;
      }
      const exists = filteredSubSubcategories.some(
        (ssc: SubSubCategory) => String(ssc.id ?? ssc._id) === prodSubSubCategory
      );
      if (exists) {
        setValue("subSubCategory", prodSubSubCategory, { shouldValidate: false });
      }
    }
  }, [
    product,
    filteredSubcategories,
    filteredSubSubcategories,
    setValue,
  ]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      console.log("Updating product with data:", data);
      
      // Create FormData for multer backend
      const formData = new FormData();

      // Helper to check nested dirty
      const hasDirty = (obj: unknown): boolean => {
        if (!obj) return false;
        if (typeof obj === "boolean") return obj;
        if (Array.isArray(obj)) return obj.some((v) => hasDirty(v));
        if (typeof obj === "object" && obj !== null) return Object.values(obj as Record<string, unknown>).some((v) => hasDirty(v));
        return false;
      };

      type DirtyFields = Partial<Record<keyof ProductFormData, boolean | Partial<Record<string, unknown>>>>;

      // Add only changed primitive/basic fields
      const dirty = dirtyFields as DirtyFields;
      if (dirty.name) formData.append("name", data.name);
      if (dirty.brand) formData.append("brand", data.brand);
      if (dirty.category) formData.append("category", data.category);
      if (dirty.subCategory) formData.append("subCategory", data.subCategory);
      if (dirty.subSubCategory) formData.append("subSubCategory", data.subSubCategory || "");
      if (dirty.searchTags) formData.append("searchTags", data.searchTags || "");

      // Add description image if provided
      if (dirty.descriptionImage && data.descriptionImage) {
        formData.append("descriptionImage", data.descriptionImage);
      }

      // Add video URL
      if (dirty.video) {
        formData.append("video", data.video || "");
      }

      // Add description (JSON string) - already in JSON format from TiptapEditor
      if (dirty.description && data.description) {
        formData.append("description", data.description);
      }

      // Add specifications only if changed
      if (hasDirty(dirty.specifications)) {
        formData.append("specifications", JSON.stringify(data.specifications));
      }

      // Handle attributes with images - only if any attribute path is dirty
      if (hasDirty(dirty.attributes)) {
        data.attributes.forEach((attribute, attrIndex) => {
          formData.append(`attributes[${attrIndex}][name]`, attribute.name);
          formData.append(`attributes[${attrIndex}][type]`, attribute.type);
          formData.append(`attributes[${attrIndex}][isRequired]`, String(attribute.isRequired || true));
          formData.append(`attributes[${attrIndex}][displayOrder]`, String(attribute.displayOrder || 0));

          attribute.values.forEach((value, valueIndex) => {
            formData.append(`attributes[${attrIndex}][values][${valueIndex}][label]`, value.label);
            formData.append(`attributes[${attrIndex}][values][${valueIndex}][value]`, value.value);
            formData.append(`attributes[${attrIndex}][values][${valueIndex}][isDefault]`, String(value.isDefault || false));
            
            if (value.colorCode) {
              formData.append(`attributes[${attrIndex}][values][${valueIndex}][colorCode]`, value.colorCode);
            }

            // Add images for color attributes (new uploads only)
            if (value.images && Array.isArray(value.images) && value.images.length > 0) {
              (value.images as File[]).forEach((image: File, imageIndex: number) => {
                formData.append(
                  `attributes[${attrIndex}][values][${valueIndex}][images][${imageIndex}]`,
                  image
                );
              });
            }
          });
        });
      }

      // Handle manual variants (optional)
      const manualVariants = (data.manualVariants || []).map(variant => {
        const priceStr = (variant.price ?? '').toString().trim();
        const isNumeric = /^\d+(?:\.\d+)?$/.test(priceStr);
        const priceVal = isNumeric ? parseFloat(priceStr) : priceStr;
        const discountPct = variant.discount ? parseFloat(variant.discount) : undefined;
        
        // Calculate discountedPrice: prefer explicit value, else calculate from price and discountPercentage
        let discountedPrice: number | undefined = undefined;
        if (variant.discountedPrice) {
          const dpStr = variant.discountedPrice.toString().trim();
          if (/^\d+(?:\.\d+)?$/.test(dpStr)) {
            discountedPrice = parseFloat(dpStr);
          }
        }
        // If no explicit discountedPrice but we have numeric price and discountPercentage, calculate it
        if (discountedPrice === undefined && typeof priceVal === 'number' && discountPct !== undefined && !isNaN(discountPct) && discountPct >= 0 && discountPct <= 100) {
          discountedPrice = priceVal * (1 - discountPct / 100);
        }
        
        return {
          attributeSelections: Object.entries(variant)
            .filter(([key, value]) => key !== 'price' && key !== 'stock' && key !== 'discount' && key !== 'discountedPrice' && value)
            .map(([key, value]) => ({
              attributeType: key,
              selectedValue: value
            })),
          price: priceVal,
          stock: parseInt(variant.stock),
          discountPercentage: discountPct,
          discountedPrice: discountedPrice
        };
      });

      if (hasDirty(dirty.manualVariants) && manualVariants.length > 0) {
        formData.append("manualVariants", JSON.stringify(manualVariants));
      }

      // Add simple price/stock/discount if provided (no variants use-case)
      if (dirty.simplePrice && data.simplePrice) formData.append("price", data.simplePrice);
      if (dirty.simpleStock && data.simpleStock) formData.append("stock", data.simpleStock);
      if (dirty.simpleDiscount && data.simpleDiscount) formData.append("discountPercentage", data.simpleDiscount);
      // Also send discountedPrice if price is numeric and discount valid
      if (dirty.simplePrice || dirty.simpleDiscount) {
        const priceStr = (data.simplePrice || "").toString().trim();
        const discountStr = (data.simpleDiscount || "").toString().trim();
        const isPriceNumeric = /^\d+(?:\.\d+)?$/.test(priceStr);
        const discountNum = parseFloat(discountStr);
        if (isPriceNumeric && !isNaN(discountNum) && discountNum >= 0 && discountNum <= 100) {
          const priceNum = parseFloat(priceStr);
          const dPrice = priceNum * (1 - discountNum / 100);
          if (Number.isFinite(dPrice)) {
            formData.append("discountedPrice", dPrice.toFixed(2));
          }
        }
      }

      // Append gallery images (if any)
      const galleryImages = (data.galleryImages as unknown as File[]) || [];
      if (hasDirty(dirty.galleryImages) && Array.isArray(galleryImages) && galleryImages.length > 0) {
        galleryImages.forEach((file) => {
          formData.append("galleryImages", file);
        });
      }

      // Add extra category routes
      if (hasDirty((dirtyFields as Record<string, unknown>).categoryAssignments)) {
        const validAssignments = (data.categoryAssignments || [])
          .filter((r: ProductFormData['categoryAssignments'][number]) => r?.category && r?.subCategory)
          .filter((r: ProductFormData['categoryAssignments'][number]) => !(r.category === data.category && r.subCategory === data.subCategory && (r.subSubCategory || "") === (data.subSubCategory || "")));
        if (validAssignments.length > 0) {
          formData.append("categoryAssignments", JSON.stringify(validAssignments));
        }
      }

      console.log("FormData prepared for backend:", formData);

      // Send to API
      const result = await updateProduct({ id: productId, formData }).unwrap();
      console.log("Product updated successfully:", result);

      toast.success("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product. Please try again.");
    }
  };

  if (isProductLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading product...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Product not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Information Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Product Information
              </h2>

              <div className="space-y-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Product Name *
                  </Label>
                  <Input
                    {...register("name")}
                    placeholder="Enter product name"
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Brand Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Brand *
                  </Label>
                  <Controller
                    control={control}
                    name="brand"
                    render={({ field }) => (
                      <Select
                        key={
                          isBrandsLoading
                            ? "brand-loading"
                            : field.value
                            ? String(field.value)
                            : ""
                        }
                        onValueChange={(val) => {
                          field.onChange(String(val));
                          setValue("brand", String(val));
                        }}
                        value={field.value ? String(field.value) : ""}
                        disabled={isBrandsLoading}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              isBrandsLoading
                                ? "Loading brands..."
                                : "Select a brand"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand: Brand) => {
                            const id = (brand.id ?? brand._id) as string;
                            const idStr = String(id);
                            const name = (brand.brandName ??
                              brand.name ??
                              "Unnamed") as string;
                            return (
                              <SelectItem key={idStr} value={idStr}>
                                {name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.brand && (
                    <p className="text-sm text-red-600">
                      {errors.brand.message}
                    </p>
                  )}
                </div>

                {/* Description Image */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Description Image
                  </Label>
                  <Controller
                    control={control}
                    name="descriptionImage"
                    render={({ field: { value, onChange, ...field } }) => (
                      <div className="space-y-2">
                        <Input
                          {...field}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            onChange(file);
                          }}
                          className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {value && (
                          <div className="relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={URL.createObjectURL(value)}
                              alt="Description preview"
                              className="w-full h-48 object-cover rounded border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                              onClick={() => onChange(undefined)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {product && ((product as ProductData).descriptionImage || (product as { description_image?: string }).description_image) && !value && (
                          <div className="space-y-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={((product as ProductData).descriptionImage || (product as { description_image?: string }).description_image) as string}
                              alt="Current description image"
                              className="w-full h-48 object-cover rounded border"
                            />
                            <p className="text-xs text-gray-500">
                              Current image. Upload a new image to replace it.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Video URL */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Video URL
                  </Label>
                  <Input
                    {...register("video")}
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    Enter a valid video URL (e.g., YouTube link) or leave empty to clear
                  </p>
                  {(() => {
                    const videoUrl = watch("video");
                    const videoId = videoUrl ? getYouTubeVideoId(videoUrl) : null;
                    return videoId ? (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Video Preview:</p>
                        <div className="relative w-full pt-[56.25%] bg-gray-200 rounded-lg overflow-hidden">
                          <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            title="Video preview"
                          />
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Product Description */}
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700"
                  >
                    Description
                  </Label>
                  <Controller
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <TiptapEditor
                        value={
                          field.value ||
                          JSON.stringify({ type: "doc", content: [] })
                        }
                        onChange={field.onChange}
                        placeholder="Enter product description"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* General Setup Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                General Setup
              </h2>

              <div className="space-y-6">
                {/* Row 1: Category, Sub Category, Sub Sub Category */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Category
                    </Label>
                    <Controller
                      control={control}
                      name="category"
                      render={({ field }) => (
                        <Select
                          key={
                            isCategoriesLoading
                              ? "category-loading"
                              : field.value
                              ? String(field.value)
                              : ""
                          }
                          onValueChange={(val) => {
                            field.onChange(String(val));
                            setValue("category", String(val));
                          }}
                          value={field.value ? String(field.value) : ""}
                          disabled={isCategoriesLoading}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                isCategoriesLoading
                                  ? "Loading categories..."
                                  : "Select a category"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c: Category) => {
                              const id = (c.id ?? c._id) as string;
                              const idStr = String(id);
                              const name = (c.name ??
                                c.categoryName ??
                                "Unnamed") as string;
                              return (
                                <SelectItem key={idStr} value={idStr}>
                                  {name}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.category && (
                      <p className="text-sm text-red-600">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Sub Category
                    </Label>
                    <Controller
                      control={control}
                      name="subCategory"
                      render={({ field }) => (
                        <Select
                          key={
                            isSubcategoriesLoading
                              ? "subcategory-loading"
                              : `${field.value || ""}-${filteredSubcategories.length}-${selectedCategoryId || ""}`
                          }
                          onValueChange={(val) => {
                            field.onChange(String(val));
                            setValue("subCategory", String(val));
                          }}
                          value={field.value ? String(field.value) : ""}
                          disabled={
                            !selectedCategoryId || isSubcategoriesLoading
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                !selectedCategoryId
                                  ? "Select a category first"
                                  : isSubcategoriesLoading
                                  ? "Loading sub categories..."
                                  : filteredSubcategories.length
                                  ? "Select a sub category"
                                  : "No sub categories"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredSubcategories.map((sc: Subcategory) => {
                              const id = (sc.id ?? sc._id) as string;
                              const idStr = String(id);
                              const name = (sc.name ??
                                sc.subCategoryName ??
                                "Unnamed") as string;
                              return (
                                <SelectItem key={idStr} value={idStr}>
                                  {name}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.subCategory && (
                      <p className="text-sm text-red-600">
                        {errors.subCategory.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Sub Sub Category
                    </Label>
                    <Controller
                      control={control}
                      name="subSubCategory"
                      render={({ field }) => (
                        <Select
                          key={
                            isSubSubcategoriesLoading
                              ? "subsubcategory-loading"
                              : `${field.value || ""}-${filteredSubSubcategories.length}-${selectedSubCategoryId || ""}`
                          }
                          onValueChange={(val) => {
                            field.onChange(String(val));
                            setValue("subSubCategory", String(val));
                          }}
                          value={field.value ? String(field.value) : ""}
                          disabled={
                            !selectedSubCategoryId || isSubSubcategoriesLoading
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                !selectedSubCategoryId
                                  ? "Select a sub category first"
                                  : isSubSubcategoriesLoading
                                  ? "Loading sub sub categories..."
                                  : filteredSubSubcategories.length
                                  ? "Select a sub sub category"
                                  : "No sub sub categories"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredSubSubcategories.map((ssc: SubSubcategory) => {
                              const id = (ssc.id ?? ssc._id) as string;
                              const idStr = String(id);
                              const name = (ssc.name ??
                                ssc.subSubCategoryName ??
                                "Unnamed") as string;
                              return (
                                <SelectItem key={idStr} value={idStr}>
                                  {name}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.subSubCategory && (
                      <p className="text-sm text-red-600">
                        {errors.subSubCategory.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2: Search Tags */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Search Tags
                    </Label>
                    <Input
                      {...register("searchTags")}
                      placeholder="Enter your search tags"
                      className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Extra Category Routes */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Extra Category Routes
                </h2>
                <Button
                  type="button"
                  onClick={() =>
                    appendAssignment({ category: "", subCategory: "", subSubCategory: "" })
                  }
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Route
                </Button>
              </div>

              {assignmentFields.length === 0 ? (
                <p className="text-sm text-gray-500">Add additional category paths as needed.</p>
              ) : (
                <div className="space-y-6">
                  {assignmentFields.map((field, index) => {
                    const selectedAssignCategoryId = watch(`categoryAssignments.${index}.category`);
                    const selectedAssignSubCategoryId = watch(`categoryAssignments.${index}.subCategory`);

                    const filteredAssignSubcategories = !selectedAssignCategoryId
                      ? ([] as Subcategory[])
                      : allSubcategories.filter((sc: Subcategory) => {
                          if (typeof sc.category === "string") return sc.category === selectedAssignCategoryId;
                          if (sc.category && typeof sc.category === "object") {
                            const id = (sc.category.id ?? sc.category._id) as string;
                            return id === selectedAssignCategoryId;
                          }
                          return sc.parentCategoryId === selectedAssignCategoryId;
                        });

                    const filteredAssignSubSubcategories = !selectedAssignSubCategoryId
                      ? ([] as SubSubcategory[])
                      : allSubSubcategories.filter((ssc: SubSubcategory) => {
                          if (typeof ssc.subcategory === "string") return ssc.subcategory === selectedAssignSubCategoryId;
                          if (ssc.subcategory && typeof ssc.subcategory === "object") {
                            const id = (ssc.subcategory.id ?? ssc.subcategory._id) as string;
                            return id === selectedAssignSubCategoryId;
                          }
                          return ssc.parentSubcategoryId === selectedAssignSubCategoryId;
                        });

                    return (
                      <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">Route {index + 1}</h3>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => removeAssignment(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Category</Label>
                            <Controller
                              control={control}
                              name={`categoryAssignments.${index}.category` as const}
                              render={({ field }) => (
                                <Select
                                  key={
                                    isCategoriesLoading
                                      ? `assign-category-loading-${index}`
                                      : field.value
                                      ? String(field.value)
                                      : `assign-category-empty-${index}`
                                  }
                                  onValueChange={(val) => {
                                    const valStr = String(val);
                                    field.onChange(valStr);
                                    setValue(`categoryAssignments.${index}.category`, valStr);
                                    setValue(`categoryAssignments.${index}.subCategory`, "");
                                    setValue(`categoryAssignments.${index}.subSubCategory`, "");
                                  }}
                                  value={field.value ? String(field.value) : ""}
                                  disabled={isCategoriesLoading}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder={isCategoriesLoading ? "Loading categories..." : "Select a category"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((c: Category) => {
                                      const id = (c.id ?? c._id) as string;
                                      const idStr = String(id);
                                      const name = (c.name ?? c.categoryName ?? "Unnamed") as string;
                                      return (
                                        <SelectItem key={idStr} value={idStr}>
                                          {name}
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Sub Category</Label>
                            <Controller
                              control={control}
                              name={`categoryAssignments.${index}.subCategory` as const}
                              render={({ field }) => (
                                <Select
                                  key={
                                    isSubcategoriesLoading
                                      ? `assign-subcategory-loading-${index}`
                                      : field.value
                                      ? String(field.value)
                                      : `assign-subcategory-empty-${index}`
                                  }
                                  onValueChange={(val) => {
                                    const valStr = String(val);
                                    field.onChange(valStr);
                                    setValue(`categoryAssignments.${index}.subCategory`, valStr);
                                    setValue(`categoryAssignments.${index}.subSubCategory`, "");
                                  }}
                                  value={field.value ? String(field.value) : ""}
                                  disabled={!selectedAssignCategoryId || isSubcategoriesLoading}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue
                                      placeholder={!selectedAssignCategoryId ? "Select a category first" : isSubcategoriesLoading ? "Loading sub categories..." : filteredAssignSubcategories.length ? "Select a sub category" : "No sub categories"}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {filteredAssignSubcategories.map((sc: Subcategory) => {
                                      const id = (sc.id ?? sc._id) as string;
                                      const idStr = String(id);
                                      const name = (sc.name ?? sc.subCategoryName ?? "Unnamed") as string;
                                      return (
                                        <SelectItem key={idStr} value={idStr}>
                                          {name}
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Sub Sub Category (optional)</Label>
                            <Controller
                              control={control}
                              name={`categoryAssignments.${index}.subSubCategory` as const}
                              render={({ field }) => (
                                <Select
                                  key={
                                    isSubSubcategoriesLoading
                                      ? `assign-subsubcategory-loading-${index}`
                                      : field.value
                                      ? String(field.value)
                                      : `assign-subsubcategory-empty-${index}`
                                  }
                                  onValueChange={(val) => {
                                    const valStr = String(val);
                                    field.onChange(valStr);
                                    setValue(`categoryAssignments.${index}.subSubCategory`, valStr);
                                  }}
                                  value={field.value ? String(field.value) : ""}
                                  disabled={!selectedAssignSubCategoryId || isSubSubcategoriesLoading}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue
                                      placeholder={!selectedAssignSubCategoryId ? "Select a sub category first" : isSubSubcategoriesLoading ? "Loading sub sub categories..." : filteredAssignSubSubcategories.length ? "Select a sub sub category" : "No sub sub categories"}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {filteredAssignSubSubcategories.map((ssc: SubSubcategory) => {
                                      const id = (ssc.id ?? ssc._id) as string;
                                      const idStr = String(id);
                                      const name = (ssc.name ?? ssc.subSubCategoryName ?? "Unnamed") as string;
                                      return (
                                        <SelectItem key={idStr} value={idStr}>
                                          {name}
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Product Attributes Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Product Attributes
                </h2>
                <Button
                  type="button"
                  onClick={() =>
                    appendAttribute({
                      name: "",
                      type: "",
                      values: [],
                      isRequired: true,
                      displayOrder: attributeFields.length,
                    })
                  }
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Attribute
                </Button>
              </div>

              <div className="space-y-6">
                {attributeFields.map((field, attrIndex) => (
                  <AttributeManager
                    key={field.id}
                    attrIndex={attrIndex}
                    control={control}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    errors={errors}
                    onRemove={() => removeAttribute(attrIndex)}
                    canRemove={attributeFields.length > 1}
                  existingAttributes={((product as ProductData)?.attributes || []) as ProductAttribute[]}
                  />
                ))}
              </div>
            </div>

            {/* Manual Variant Creation */}
            <VariantCreator
              attributes={watch("attributes")}
              onAddVariant={(variant) => appendManualVariant(variant)}
            />

            {/* Variant List */}
            <VariantList
              variants={manualVariantFields}
              onEditVariant={updateManualVariant}
              onDeleteVariant={removeManualVariant}
              attributes={watch("attributes")}
            />

            {/* Gallery Images */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Gallery Images</h2>
                <Button
                  type="button"
                  className="flex items-center gap-2"
                  onClick={() => {
                    const input = document.getElementById("gallery-images-input") as HTMLInputElement;
                    input?.click();
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Images
                </Button>
              </div>

              {/* Show existing gallery images if available */}
              {(product as ProductData)?.images && Array.isArray((product as ProductData).images) && ((product as ProductData).images as string[]).length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Gallery Images:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {((product as ProductData).images as string[]).map((imgUrl, idx) => (
                      <div key={idx} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`Gallery image ${idx + 1}`}
                          className="w-full h-28 object-cover rounded border"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-center">Current Image {idx + 1}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Upload new images below to add to gallery.</p>
                </div>
              )}

              <input
                id="gallery-images-input"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const current = (watch("galleryImages") as unknown as File[]) || [];
                  setValue("galleryImages", [...current, ...files] as File[], { shouldDirty: true, shouldValidate: false });
                }}
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {(watch("galleryImages") as unknown as File[] | undefined)?.map((file, idx) => (
                  <div key={idx} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Gallery image ${idx + 1}`}
                      className="w-full h-28 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100"
                      onClick={() => {
                        const current = (watch("galleryImages") as unknown as File[]) || [];
                        const updated = current.filter((_, i) => i !== idx);
                        setValue("galleryImages", updated as File[], { shouldDirty: true, shouldValidate: false });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Simple Pricing (no attributes/variants) */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Simple Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Price</Label>
                  <Input
                    type="text"
                    {...register("simplePrice")}
                    placeholder="Enter price (e.g., 10000 or TBA)"
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Stock</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    {...register("simpleStock")}
                    placeholder="Enter stock"
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Discount (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    {...register("simpleDiscount")}
                    placeholder="Enter discount percentage"
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">0 to 100. Leave empty if none.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Discounted Price</Label>
                  <Input
                    type="text"
                    readOnly
                    value={(function(){
                      const priceStr = (watch("simplePrice") || "").toString().trim();
                      const isNumeric = /^\d+(?:\.\d+)?$/.test(priceStr);
                      const discStr = watch("simpleDiscount") || "";
                      const discount = parseFloat(discStr);
                      if (!isNumeric || isNaN(discount) || discount < 0 || discount > 100) return "";
                      const price = parseFloat(priceStr);
                      const calc = price * (1 - discount/100);
                      return Number.isFinite(calc) ? calc.toFixed(2) : "";
                    })()}
                    placeholder="Auto-calculated"
                    className="w-full border-gray-300 bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">Auto-calculated when price is numeric.</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Use this when you don&apos;t need attributes/variants.</p>
            </div>

            {/* Specifications Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Specifications
                </h2>
                <Button
                  type="button"
                  onClick={() => appendSpec({ key: "", value: "" })}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Specification
                </Button>
              </div>

              <div className="space-y-4">
                {specFields.map((field, index) => (
                  <div key={field.id} className="">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">
                        Specification {index + 1}
                      </h3>
                      {specFields.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeSpec(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Key *
                        </Label>
                        <Input
                          {...register(`specifications.${index}.key`)}
                          placeholder="e.g., Display, Battery"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.specifications?.[index]?.key && (
                          <p className="text-sm text-red-600">
                            {errors.specifications[index]?.key?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Value *
                        </Label>
                        <Input
                          {...register(`specifications.${index}.value`)}
                          placeholder="e.g., 6.1 inches, 4000mAh"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.specifications?.[index]?.value && (
                          <p className="text-sm text-red-600">
                            {errors.specifications[index]?.value?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
          disabled={isUpdating || !isAnyDirty}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 disabled:opacity-50"
              >
          {isUpdating ? "Updating Product..." : "Update Product"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Attribute Manager Component
function AttributeManager({
  attrIndex,
  control,
  register,
  watch,
  setValue,
  errors,
  onRemove,
  canRemove,
  existingAttributes,
}: AttributeManagerProps) {
  const {
    fields: valueFields,
    append: appendValue,
    remove: removeValue,
  } = useFieldArray({
    control,
    name: `attributes.${attrIndex}.values`,
  });

  const attributeType = watch(`attributes.${attrIndex}.type`);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Attribute {attrIndex + 1}</CardTitle>
          {canRemove && (
            <Button
              type="button"
              onClick={onRemove}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Attribute Name *</Label>
            <Input
              {...register(`attributes.${attrIndex}.name`)}
              placeholder="e.g., Color, Storage"
            />
            {errors.attributes?.[attrIndex]?.name && (
              <p className="text-sm text-red-600">
                {errors.attributes[attrIndex]?.name?.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Attribute Type *</Label>
            <Controller
              control={control}
              name={`attributes.${attrIndex}.type`}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Auto-update attribute name when type changes
                    const selectedType = TECH_ATTRIBUTE_TYPES.find(
                      (type) => type.value === value
                    );
                    if (selectedType) {
                      setValue(
                        `attributes.${attrIndex}.name`,
                        selectedType.label
                      );
                    }
                  }}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select attribute type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TECH_ATTRIBUTE_TYPES.filter(
                      (type) => type.value && type.value.trim() !== ""
                    ).map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.attributes?.[attrIndex]?.type && (
              <p className="text-sm text-red-600">
                {errors.attributes[attrIndex]?.type?.message}
              </p>
            )}
          </div>
        </div>

        {/* Attribute Values */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Attribute Values</Label>
            <Button
              type="button"
              onClick={() =>
                appendValue({
                  label: "",
                  value: "",
                  colorCode: "",
                  images: [],
                  isDefault: false,
                })
              }
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Value
            </Button>
          </div>

          {valueFields.map((valueField, valueIndex) => (
            <AttributeValueManager
              key={valueField.id}
              attrIndex={attrIndex}
              valueIndex={valueIndex}
              attributeType={attributeType}
              control={control}
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
              onRemove={() => removeValue(valueIndex)}
              canRemove={valueFields.length > 1}
              existingImageUrls={
                Array.isArray(existingAttributes?.[attrIndex]?.values?.[valueIndex]?.images)
                  ? (existingAttributes?.[attrIndex]?.values?.[valueIndex]?.images as string[])
                  : []
              }
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Utility function to convert label to backend-friendly value
const convertLabelToValue = (label: string): string => {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
};

// Attribute Value Manager Component
function AttributeValueManager({
  attrIndex,
  valueIndex,
  attributeType,
  control,
  register,
  watch,
  setValue,
  errors,
  onRemove,
  canRemove,
  existingImageUrls,
}: AttributeValueManagerProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Value {valueIndex + 1}</h4>
        {canRemove && (
          <Button
            type="button"
            onClick={onRemove}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Label *</Label>
          <Controller
            control={control}
            name={`attributes.${attrIndex}.values.${valueIndex}.label`}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="e.g., Space Black, 256GB"
                onChange={(e) => {
                  const labelValue = e.target.value;
                  field.onChange(e);
                  const convertedValue = convertLabelToValue(labelValue);
                  setValue(
                    `attributes.${attrIndex}.values.${valueIndex}.value`,
                    convertedValue
                  );
                }}
              />
            )}
          />
          {errors.attributes?.[attrIndex]?.values?.[valueIndex]?.label && (
            <p className="text-sm text-red-600">
              {errors.attributes[attrIndex]?.values[valueIndex]?.label?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Value *</Label>
          <Input
            {...register(`attributes.${attrIndex}.values.${valueIndex}.value`)}
            placeholder="e.g., space-black, 256gb"
          />
          <p className="text-xs text-gray-500">
            Auto-generated from label (backend-friendly format)
          </p>
          {errors.attributes?.[attrIndex]?.values?.[valueIndex]?.value && (
            <p className="text-sm text-red-600">
              {errors.attributes[attrIndex]?.values[valueIndex]?.value?.message}
            </p>
          )}
        </div>
      </div>

      {/* Color-specific fields */}
      {attributeType === "color" && (
        <>
          <div className="space-y-2">
            <Label>Color Code</Label>
            <div className="flex gap-2">
              <Input
                {...register(
                  `attributes.${attrIndex}.values.${valueIndex}.colorCode`
                )}
                placeholder="#000000"
              />
              <div
                className="w-10 h-10 border border-gray-300 rounded"
                style={{
                  backgroundColor:
                    watch(
                      `attributes.${attrIndex}.values.${valueIndex}.colorCode`
                    ) || "#ffffff",
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Images for this color</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => {
                  const fileInput = document.getElementById(
                    `color-images-${attrIndex}-${valueIndex}`
                  ) as HTMLInputElement;
                  fileInput?.click();
                }}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Images
              </Button>
            </div>

            <input
              id={`color-images-${attrIndex}-${valueIndex}`}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                const currentImages =
                  watch(
                    `attributes.${attrIndex}.values.${valueIndex}.images`
                  ) || [];
                setValue(
                  `attributes.${attrIndex}.values.${valueIndex}.images`,
                  [...currentImages, ...files],
                  { shouldDirty: true, shouldValidate: false }
                );
              }}
            />

            {Array.isArray(existingImageUrls) && existingImageUrls.length > 0 && (
              <div className="space-y-2 mt-2">
                <p className="text-sm font-medium text-gray-700">Current Images</p>
                <div className="grid grid-cols-4 gap-2">
                  {existingImageUrls.map((url: string, imageIndex: number) => (
                    <div key={imageIndex} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Existing color ${valueIndex + 1} image ${imageIndex + 1}`}
                        className="w-full h-16 object-cover rounded border"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">These are already saved. New uploads will be added on update.</p>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              {watch(
                `attributes.${attrIndex}.values.${valueIndex}.images`
              )?.map((file: File, imageIndex: number) => (
                <div key={imageIndex} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Color ${valueIndex + 1} image ${imageIndex + 1}`}
                    className="w-full h-16 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const currentImages =
                        watch(
                          `attributes.${attrIndex}.values.${valueIndex}.images`
                        ) || [];
                      const updatedImages = currentImages.filter(
                        (_: File, i: number) => i !== imageIndex
                      );
                      setValue(
                        `attributes.${attrIndex}.values.${valueIndex}.images`,
                        updatedImages,
                        { shouldDirty: true, shouldValidate: false }
                      );
                    }}
                    variant="destructive"
                    size="sm"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Variant Creator Component
function VariantCreator({ attributes, onAddVariant }: VariantCreatorProps) {
  const [selections, setSelections] = React.useState<{ [key: string]: string }>(
    {}
  );
  const [price, setPrice] = React.useState("");
  const [stock, setStock] = React.useState("");
  const [discount, setDiscount] = React.useState("");

  // Calculate discounted price
  const calculateDiscountedPrice = () => {
    if (!price) return null;
    const priceNum = parseFloat(price);
    const hasDiscountInput = discount !== "" && discount !== null && discount !== undefined;
    const discountNum = hasDiscountInput ? parseFloat(discount) : NaN;
    if (isNaN(priceNum)) return null;
    if (!hasDiscountInput) return null;
    if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) return null;
    return priceNum * (1 - discountNum / 100);
  };
  const discountedPrice = calculateDiscountedPrice();

  const handleAddVariant = () => {
    if (!price || !stock) {
      toast.error("Please set price and stock");
      return;
    }

    const priceNum = parseFloat(price);
    const discountNum = discount ? parseFloat(discount) : NaN;
    const dPrice = !isNaN(priceNum) && !isNaN(discountNum) && discountNum >= 0 && discountNum <= 100
      ? (priceNum * (1 - discountNum / 100)).toFixed(2)
      : undefined;

    const variant = {
      ...selections,
      price: price,
      stock: stock,
      discount: discount || undefined,
      discountedPrice: dPrice
    };

    onAddVariant(variant);
    toast.success("Variant added successfully");
    setSelections({});
    setPrice("");
    setStock("");
    setDiscount("");
  };

  const getAttributeLabel = (attrType: string, value: string) => {
    const attribute = attributes.find((attr) => attr.type === attrType);
    if (attribute) {
      const attrValue = attribute.values.find(
        (val) => val.value === value
      );
      return attrValue ? attrValue.label : value;
    }
    return value;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Variant</CardTitle>
        <p className="text-sm text-gray-600">
          Select attributes from your attribute pool to create a specific
          variant
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attributes
            .filter((attribute) => attribute.name && attribute.type)
            .map((attribute, index: number) => {
              const validValues =
                attribute.values?.filter(
                  (value) => value.value && value.value.trim() !== ""
                ) || [];

              return (
                <div key={index} className="space-y-2">
                  <Label>{attribute.name}</Label>
                  <Select
                    value={selections[attribute.type] || ""}
                    onValueChange={(value) => {
                      setSelections((prev) => ({
                        ...prev,
                        [attribute.type]: value,
                      }));
                    }}
                    disabled={validValues.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          validValues.length === 0
                            ? `No ${attribute.name} values added`
                            : `Select ${attribute.name}`
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {validValues.length > 0 ? (
                        validValues.map((value, valueIndex: number) => (
                          <SelectItem key={valueIndex} value={value.value}>
                            {value.label}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500">
                          No values added for {attribute.name}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Price *</Label>
            <Input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter variant price (e.g., 10000 or TBA)"
            />
          </div>
          <div className="space-y-2">
            <Label>Stock *</Label>
            <Input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Enter stock quantity"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Discount (%)</Label>
            <Input
              type="number"
              value={discount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                  setDiscount(value);
                }
              }}
              placeholder="Enter discount percentage"
              min="0"
              max="100"
              step="0.01"
            />
            <p className="text-xs text-gray-500">
              Enter a percentage between 0 and 100
            </p>
          </div>
          <div className="space-y-2">
            <Label>Discounted Price</Label>
            <Input
              type="number"
              value={discountedPrice !== null ? discountedPrice.toFixed(2) : ""}
              placeholder="Auto-calculated"
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">
              Calculated automatically from price and discount
            </p>
          </div>
        </div>

        {(Object.keys(selections).length > 0 || price || stock) && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">Preview:</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(selections).map(([attrType, value]) => (
                <Badge key={attrType} variant="secondary">
                  {attrType}: {getAttributeLabel(attrType, value)}
                </Badge>
              ))}
              <Badge variant="outline">Stock: {stock || "0"}</Badge>
              <Badge variant="outline">
                {(() => {
                  const isNumeric = /^\d+(?:\.\d+)?$/.test(price);
                  if (!price) return "Price: 0";
                  return isNumeric ? `Price: ৳${parseFloat(price).toLocaleString()}` : `Price: ${price}`;
                })()}
              </Badge>
              {discount && (
                <Badge variant="outline">
                  Discount: {discount}%
                </Badge>
              )}
              {discountedPrice !== null && (
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Discounted Price: ৳{discountedPrice.toFixed(2)}
                </Badge>
              )}
            </div>
          </div>
        )}

        <Button onClick={handleAddVariant} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </CardContent>
    </Card>
  );
}

// Variant List Component
function VariantList({
  variants,
  onEditVariant,
  onDeleteVariant,
  attributes,
}: VariantListProps) {
  const getAttributeLabel = (attrType: string, value: string) => {
    const attribute = attributes.find((attr) => attr.type === attrType);
    if (attribute) {
      const attrValue = attribute.values.find(
        (val) => val.value === value
      );
      return attrValue ? attrValue.label : value;
    }
    return value;
  };

  const calculateVariantPrice = (variant: ProductFormData['manualVariants'][number]) => {
    const priceVal = variant.price;
    if (typeof priceVal === "number") return priceVal;
    const priceStr = (priceVal ?? "").toString();
    const isNumeric = /^\d+(?:\.\d+)?$/.test(priceStr);
    return isNumeric ? parseFloat(priceStr) : priceStr;
  };

  const calculateDiscountedPrice = (variant: ProductFormData['manualVariants'][number]) => {
    const priceVal = calculateVariantPrice(variant);
    if (typeof priceVal !== "number") return null;
    const priceNum = priceVal;
    // allow 0% discount; treat empty string as no-discount (null result)
    const hasDiscountInput = variant.discount !== "" && variant.discount !== null && variant.discount !== undefined;
    if (!hasDiscountInput || !variant.discount) return null;
    const discountNum = parseFloat(variant.discount);
    if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) return null;
    return priceNum * (1 - discountNum / 100);
  };


  if (variants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Created Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-gray-400" />
              </div>
              <span className="text-sm">No variants created yet</span>
              <span className="text-xs">
                Use the variant creator above to add your first variant
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Created Variants ({variants.length})</CardTitle>
        <p className="text-sm text-gray-600">
          These are the exact variants that will be created for your product
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {variants.map((variant: ProductFormData['manualVariants'][number], index: number) => (
            <div
              key={index}
              className="p-4 border rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {Object.entries(variant).map(([key, value]) => {
                      if (
                        key !== "customPrice" &&
                        key !== "stock" &&
                        key !== "id" &&
                        key !== "price" &&
                        value
                      ) {
                        return (
                          <Badge key={key} variant="secondary">
                            {key}: {getAttributeLabel(key, value as string)}
                          </Badge>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onDeleteVariant(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 items-center">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-gray-700">Price</Label>
                  <Input
                    type="text"
                    value={variant.price ?? ""}
                    onChange={(e) => {
                      const newPrice = e.target.value;
                      // Recalculate discountedPrice if discount exists
                      let newDiscountedPrice: string | undefined = undefined;
                      const priceStr = newPrice.trim();
                      const isNumeric = /^\d+(?:\.\d+)?$/.test(priceStr);
                      if (isNumeric && variant.discount && variant.discount !== "") {
                        const priceNum = parseFloat(priceStr);
                        const discountNum = parseFloat(variant.discount);
                        if (!isNaN(discountNum) && discountNum >= 0 && discountNum <= 100) {
                          const calc = priceNum * (1 - discountNum / 100);
                          if (Number.isFinite(calc)) {
                            newDiscountedPrice = calc.toFixed(2);
                          }
                        }
                      }
                      onEditVariant(index, { 
                        ...variant, 
                        price: newPrice, 
                        discountedPrice: newDiscountedPrice
                      });
                    }}
                    placeholder="e.g., 10000 or TBA"
                    className="w-32"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-gray-700">Stock</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={variant.stock ?? ""}
                    onChange={(e) => {
                      onEditVariant(index, { ...variant, stock: e.target.value });
                    }}
                    className="w-28"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-gray-700">Discount (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={variant.discount ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "" || (parseFloat(v) >= 0 && parseFloat(v) <= 100)) {
                        // Calculate discountedPrice when discount changes
                        const priceVal = calculateVariantPrice(variant);
                        let newDiscountedPrice: string | undefined = undefined;
                        if (typeof priceVal === "number" && v !== "") {
                          const discountNum = parseFloat(v);
                          if (!isNaN(discountNum) && discountNum >= 0 && discountNum <= 100) {
                            const calc = priceVal * (1 - discountNum / 100);
                            if (Number.isFinite(calc)) {
                              newDiscountedPrice = calc.toFixed(2);
                            }
                          }
                        }
                        onEditVariant(index, { 
                          ...variant, 
                          discount: v, 
                          discountedPrice: newDiscountedPrice
                        });
                      }
                    }}
                    className="w-28"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-gray-700">Discounted Price</Label>
                  <Input
                    type="text"
                    readOnly
                    value={(function(){
                      const calc = calculateDiscountedPrice(variant);
                      if (calc !== null) return calc.toFixed(2);
                      const dp = variant.discountedPrice;
                      if (dp === undefined || dp === null || dp === '') return '';
                      const n = parseFloat(dp);
                      return Number.isFinite(n) ? n.toFixed(2) : '';
                    })()}
                    placeholder="Auto-calculated or saved"
                    className="w-32 bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
