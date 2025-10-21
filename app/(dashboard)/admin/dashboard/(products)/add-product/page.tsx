"use client";

import React from "react";
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
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, X } from "lucide-react";
import dynamic from "next/dynamic";
import {
  useGetCategoriesQuery,
  useGetSubcategoriesQuery,
} from "@/app/redux/features/category-subcategory/category-subcategory.api";
import { useGetBrandsQuery } from "@/app/redux/features/brand/brand.api";
import { useCreateProductMutation } from "@/app/redux/features/product/product.api";

// Dynamically import Tiptap to avoid SSR issues
const TiptapEditor = dynamic(() => import("@/components/ui/tiptap-editor"), {
  ssr: false,
});

// Categories and subcategories come from API

const offerTags = [
  { id: "sale", name: "Sale" },
  { id: "new", name: "New" },
  { id: "hot", name: "Hot" },
  { id: "featured", name: "Featured" },
  { id: "limited", name: "Limited" },
];

// Validation schema
const variantSchema = z.object({
  price: z.string().min(1, "Price is required"),
  colorName: z.string().min(1, "Color name is required"),
  colorCode: z.string().min(1, "Color code is required"),
  stock: z.string().min(1, "Stock is required"),
  storage: z.string().min(1, "Storage is required"),
  region: z.string().min(1, "Region is required"),
  type: z.string().min(1, "Type is required"),
  network: z.string().min(1, "Network is required"),
  images: z.array(z.instanceof(File)).optional(),
});

const specificationSchema = z.object({
  left: z.string().min(1, "Left field is required"),
  right: z.string().min(1, "Right field is required"),
});

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  brand: z.string().min(1, "Brand is required"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "Sub Category is required"),
  searchTags: z.string().optional(),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
  specifications: z
    .array(specificationSchema)
    .min(1, "At least one specification is required"),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AddProductPage() {
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: JSON.stringify({
        type: "doc",
        content: []
      }),
      brand: "",
      category: "",
      subCategory: "",
      searchTags: "",
      variants: [
        {
          price: "",
          colorName: "",
          colorCode: "",
          stock: "",
          storage: "",
          region: "",
          type: "",
          network: "",
          images: [],
        },
      ],
      specifications: [{ left: "", right: "" }],
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({
    control,
    name: "specifications",
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      console.log(data);
      // Create FormData for multer backend
      const formData = new FormData();

      // Add basic product data
      formData.append("name", data.name);
      formData.append("brand", data.brand);
      formData.append("category", data.category);
      formData.append("subCategory", data.subCategory);
      formData.append("searchTags", data.searchTags || "");

      // Add description (JSON string) - already in JSON format from TiptapEditor
      if (data.description) {
        formData.append("description", data.description);
      }

      // Add specifications (convert left/right to key/value for backend)
      const specifications = data.specifications.map((spec) => ({
        key: spec.left,
        value: spec.right,
      }));
      formData.append("specifications", JSON.stringify(specifications));

      // Handle variants with images
      data.variants.forEach((variant, variantIndex) => {
        // Add variant data
        formData.append(`variants[${variantIndex}][price]`, variant.price);
        formData.append(`variants[${variantIndex}][stock]`, variant.stock);
        formData.append(
          `variants[${variantIndex}][colorName]`,
          variant.colorName
        );
        formData.append(
          `variants[${variantIndex}][colorCode]`,
          variant.colorCode
        );
        formData.append(`variants[${variantIndex}][storage]`, variant.storage);
        formData.append(`variants[${variantIndex}][region]`, variant.region);
        formData.append(`variants[${variantIndex}][type]`, variant.type);
        formData.append(`variants[${variantIndex}][network]`, variant.network);

        // Add variant images as files
        if (variant.images && variant.images.length > 0) {
          variant.images.forEach((image, imageIndex) => {
            formData.append(
              `variants[${variantIndex}][images][${imageIndex}]`,
              image
            );
          });
        }
      });

      console.log("FormData prepared for backend:", formData);

      // Send to API
      const result = await createProduct(formData).unwrap();
      console.log("Product created successfully:", result);

      // TODO: Show success message and redirect
    } catch (error) {
      console.error("Error creating product:", error);
      // TODO: Show error message
    }
  };

  // Load brands, categories and subcategories
  const { data: brandsResp, isFetching: isBrandsLoading } =
    useGetBrandsQuery(undefined);
  const { data: categoriesResp, isFetching: isCategoriesLoading } =
    useGetCategoriesQuery(undefined);
  const { data: subcategoriesResp, isFetching: isSubcategoriesLoading } =
    useGetSubcategoriesQuery(undefined);

  const brands: any[] = (brandsResp?.data ?? brandsResp ?? []) as any[];
  const categories: any[] = (categoriesResp?.data ??
    categoriesResp ??
    []) as any[];
  const allSubcategories: any[] = (subcategoriesResp?.data ??
    subcategoriesResp ??
    []) as any[];

  // Watch selected category to filter subcategories
  const selectedCategoryId = watch("category");

  const filteredSubcategories = React.useMemo(() => {
    if (!selectedCategoryId) return [];
    return allSubcategories.filter((sc: any) => {
      if (typeof sc.category === "string")
        return sc.category === selectedCategoryId;
      if (sc.category && typeof sc.category === "object") {
        const id = (sc.category.id ?? sc.category._id) as string;
        return id === selectedCategoryId;
      }
      // fallback to potential parentId field
      return sc.parentCategoryId === selectedCategoryId;
    });
  }, [allSubcategories, selectedCategoryId]);

  // Clear subCategory when category changes
  React.useEffect(() => {
    setValue("subCategory", "");
  }, [selectedCategoryId, setValue]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Product</h1>

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
                    <p className="text-sm text-red-600">{errors.name.message}</p>
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                          {brands.map((brand: any) => {
                            const id = (brand.id ?? brand._id) as string;
                            const name = (brand.brandName ??
                              brand.name ??
                              "Unnamed") as string;
                            return (
                              <SelectItem key={id} value={id}>
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
                        value={field.value || JSON.stringify({ type: "doc", content: [] })}
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
                {/* Row 1: Category, Sub Category, Search Tags */}
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
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                            {categories.map((c: any) => {
                              const id = (c.id ?? c._id) as string;
                              const name = (c.name ??
                                c.categoryName ??
                                "Unnamed") as string;
                              return (
                                <SelectItem key={id} value={id}>
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
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                            {filteredSubcategories.map((sc: any) => {
                              const id = (sc.id ?? sc._id) as string;
                              const name = (sc.name ??
                                sc.subCategoryName ??
                                "Unnamed") as string;
                              return (
                                <SelectItem key={id} value={id}>
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

            {/* Product Variants Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Product Variants
                </h2>
                <Button
                  type="button"
                  onClick={() =>
                    appendVariant({
                      price: "",
                      colorName: "",
                      colorCode: "",
                      stock: "",
                      storage: "",
                      region: "",
                      type: "",
                      network: "",
                      images: [],
                    })
                  }
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Variant
                </Button>
              </div>

              <div className="space-y-4">
                {variantFields.map((field, index) => (
                  <div key={field.id} className="">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        Variant {index + 1}
                      </h3>
                      {variantFields.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeVariant(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Price *
                        </Label>
                        <Input
                          {...register(`variants.${index}.price`)}
                          placeholder="Enter price"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.variants?.[index]?.price && (
                          <p className="text-sm text-red-600">
                            {errors.variants[index]?.price?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Color Name *
                        </Label>
                        <Input
                          {...register(`variants.${index}.colorName`)}
                          placeholder="Enter color name"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.variants?.[index]?.colorName && (
                          <p className="text-sm text-red-600">
                            {errors.variants[index]?.colorName?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Color Code *
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            {...register(`variants.${index}.colorCode`)}
                            placeholder="#000000"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                          <Controller
                            control={control}
                            name={`variants.${index}.colorCode`}
                            render={({ field }) => (
                              <div
                                className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                                style={{
                                  backgroundColor: field.value || "#ffffff",
                                }}
                              />
                            )}
                          />
                        </div>
                        {errors.variants?.[index]?.colorCode && (
                          <p className="text-sm text-red-600">
                            {errors.variants[index]?.colorCode?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Stock *
                        </Label>
                        <Input
                          {...register(`variants.${index}.stock`)}
                          placeholder="Enter stock quantity"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.variants?.[index]?.stock && (
                          <p className="text-sm text-red-600">
                            {errors.variants[index]?.stock?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Storage *
                        </Label>
                        <Input
                          {...register(`variants.${index}.storage`)}
                          placeholder="Enter storage capacity"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.variants?.[index]?.storage && (
                          <p className="text-sm text-red-600">
                            {errors.variants[index]?.storage?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Region *
                        </Label>
                        <Input
                          {...register(`variants.${index}.region`)}
                          placeholder="Enter region"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.variants?.[index]?.region && (
                          <p className="text-sm text-red-600">
                            {errors.variants[index]?.region?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Type *
                        </Label>
                        <Input
                          {...register(`variants.${index}.type`)}
                          placeholder="Enter type"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.variants?.[index]?.type && (
                          <p className="text-sm text-red-600">
                            {errors.variants[index]?.type?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Network *
                        </Label>
                        <Input
                          {...register(`variants.${index}.network`)}
                          placeholder="Enter network type"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.variants?.[index]?.network && (
                          <p className="text-sm text-red-600">
                            {errors.variants[index]?.network?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Product Images for this Variant */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-medium text-gray-900">
                          Product Images
                        </h4>
                        <Button
                          type="button"
                          onClick={() => {
                            const fileInput = document.getElementById(
                              `image-upload-${index}`
                            ) as HTMLInputElement;
                            fileInput?.click();
                          }}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Images
                        </Button>
                      </div>

                      <input
                        id={`image-upload-${index}`}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          const currentImages =
                            watch(`variants.${index}.images`) || [];
                          setValue(`variants.${index}.images`, [
                            ...currentImages,
                            ...files,
                          ]);
                        }}
                      />

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {watch(`variants.${index}.images`)?.map(
                          (file: File, imageIndex: number) => (
                            <div key={imageIndex} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Variant ${index + 1} image ${
                                  imageIndex + 1
                                }`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                              <Button
                                type="button"
                                onClick={() => {
                                  const currentImages =
                                    watch(`variants.${index}.images`) || [];
                                  const updatedImages = currentImages.filter(
                                    (_: File, i: number) => i !== imageIndex
                                  );
                                  setValue(
                                    `variants.${index}.images`,
                                    updatedImages
                                  );
                                }}
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )
                        )}
                      </div>

                      {watch(`variants.${index}.images`)?.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <Plus className="h-6 w-6 text-gray-400" />
                            </div>
                            <span className="text-sm">No images uploaded</span>
                            <span className="text-xs">
                              Click "Add Images" to upload photos
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specifications Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Specifications
                </h2>
                <Button
                  type="button"
                  onClick={() => appendSpec({ left: "", right: "" })}
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
                          Left Field *
                        </Label>
                        <Input
                          {...register(`specifications.${index}.left`)}
                          placeholder="Enter left specification"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.specifications?.[index]?.left && (
                          <p className="text-sm text-red-600">
                            {errors.specifications[index]?.left?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Right Field *
                        </Label>
                        <Input
                          {...register(`specifications.${index}.right`)}
                          placeholder="Enter right specification"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.specifications?.[index]?.right && (
                          <p className="text-sm text-red-600">
                            {errors.specifications[index]?.right?.message}
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
                disabled={isCreating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 disabled:opacity-50"
              >
                {isCreating ? "Creating Product..." : "Create Product"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
