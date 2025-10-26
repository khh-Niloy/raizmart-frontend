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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X, Eye, EyeOff } from "lucide-react";
import dynamic from "next/dynamic";
import {
  useGetCategoriesQuery,
  useGetSubcategoriesQuery,
  useGetSubSubcategoriesQuery,
} from "@/app/redux/features/category-subcategory/category-subcategory.api";
import { useGetBrandsQuery } from "@/app/redux/features/brand/brand.api";
import { useCreateProductMutation } from "@/app/redux/features/product/product.api";
import { Control, FieldErrors, UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { toast } from "sonner";

// Dynamically import Tiptap to avoid SSR issues
const TiptapEditor = dynamic(() => import("@/components/ui/tiptap-editor"), {
  ssr: false,
});

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
  values: z.array(attributeValueSchema).min(1, "At least one value is required"),
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
});

const specificationSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  brand: z.string().min(1, "Brand is required"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "Sub Category is required"),
  subSubCategory: z.string().optional(),
  searchTags: z.string().optional(),
  attributes: z.array(attributeSchema).min(1, "At least one attribute is required"),
  manualVariants: z.array(manualVariantSchema).min(1, "At least one variant is required"),
  specifications: z.array(specificationSchema).min(1, "At least one specification is required"),
});

type ProductFormData = z.infer<typeof productSchema>;

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
}

interface VariantPreviewProps {
  attributes: any[];
  basePrice: string;
}

interface VariantCreatorProps {
  attributes: any[];
  onAddVariant: (variant: any) => void;
}

interface VariantListProps {
  variants: any[];
  onEditVariant: (index: number, variant: any) => void;
  onDeleteVariant: (index: number) => void;
  attributes: any[];
}

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
      subSubCategory: "",
      searchTags: "",
      attributes: [],
      manualVariants: [],
      specifications: [],
    },
  });

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

  const onSubmit = async (data: ProductFormData) => {
    try {
      console.log(data);
      
      // Validate that at least one variant is created
      if (!data.manualVariants || data.manualVariants.length === 0) {
        toast.error("Please create at least one variant before submitting");
        return;
      }
      
      // Create FormData for multer backend
      const formData = new FormData();

      // Add basic product data
      formData.append("name", data.name);
      formData.append("brand", data.brand);
      formData.append("category", data.category);
      formData.append("subCategory", data.subCategory);
      formData.append("subSubCategory", data.subSubCategory || "");
      formData.append("searchTags", data.searchTags || "");

      // Add description (JSON string) - already in JSON format from TiptapEditor
      if (data.description) {
        formData.append("description", data.description);
      }

      // Add specifications
      formData.append("specifications", JSON.stringify(data.specifications));

      // Handle attributes with images
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

          // Add images for color attributes
          if (value.images && value.images.length > 0) {
            value.images.forEach((image, imageIndex) => {
              formData.append(
                `attributes[${attrIndex}][values][${valueIndex}][images][${imageIndex}]`,
                image
              );
            });
          }
        });
      });

      // Handle manual variants
      const manualVariants = data.manualVariants.map(variant => ({
        attributeSelections: Object.entries(variant)
          .filter(([key, value]) => key !== 'price' && key !== 'stock' && value)
          .map(([key, value]) => ({
            attributeType: key,
            selectedValue: value
          })),
        price: parseInt(variant.price),
        stock: parseInt(variant.stock)
      }));
      
      formData.append("manualVariants", JSON.stringify(manualVariants));

      console.log("FormData prepared for backend:", formData);

      // Send to API
      const result = await createProduct(formData).unwrap();
      console.log("Product created successfully:", result);
      
      toast.success("Product created successfully!");
      // TODO: Redirect to product list or clear form
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product. Please try again.");
    }
  };

  // Load brands, categories, subcategories and sub-subcategories
  const { data: brandsResp, isFetching: isBrandsLoading } =
    useGetBrandsQuery(undefined);
  const { data: categoriesResp, isFetching: isCategoriesLoading } =
    useGetCategoriesQuery(undefined);
  const { data: subcategoriesResp, isFetching: isSubcategoriesLoading } =
    useGetSubcategoriesQuery(undefined);
  const { data: subSubcategoriesResp, isFetching: isSubSubcategoriesLoading } =
    useGetSubSubcategoriesQuery(undefined);

  const brands: any[] = (brandsResp?.data ?? brandsResp ?? []) as any[];
  const categories: any[] = (categoriesResp?.data ??
    categoriesResp ??
    []) as any[];
  const allSubcategories: any[] = (subcategoriesResp?.data ??
    subcategoriesResp ??
    []) as any[];
  const allSubSubcategories: any[] = (subSubcategoriesResp?.data ??
    subSubcategoriesResp ??
    []) as any[];

  // Watch selected category and subcategory to filter subcategories and sub-subcategories
  const selectedCategoryId = watch("category");
  const selectedSubCategoryId = watch("subCategory");

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

  const filteredSubSubcategories = React.useMemo(() => {
    if (!selectedSubCategoryId) return [];
    return allSubSubcategories.filter((ssc: any) => {
      if (typeof ssc.subcategory === "string")
        return ssc.subcategory === selectedSubCategoryId;
      if (ssc.subcategory && typeof ssc.subcategory === "object") {
        const id = (ssc.subcategory.id ?? ssc.subcategory._id) as string;
        return id === selectedSubCategoryId;
      }
      // fallback to potential parentId field
      return ssc.parentSubcategoryId === selectedSubCategoryId;
    });
  }, [allSubSubcategories, selectedSubCategoryId]);

  // Clear subCategory when category changes
  React.useEffect(() => {
    setValue("subCategory", "");
    setValue("subSubCategory", "");
  }, [selectedCategoryId, setValue]);

  // Clear subSubCategory when subCategory changes
  React.useEffect(() => {
    setValue("subSubCategory", "");
  }, [selectedSubCategoryId, setValue]);

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
                      Sub Sub Category
                    </Label>
                    <Controller
                      control={control}
                      name="subSubCategory"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                            {filteredSubSubcategories.map((ssc: any) => {
                              const id = (ssc.id ?? ssc._id) as string;
                              const name = (ssc.name ??
                                ssc.subSubCategoryName ??
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

// Attribute Manager Component
function AttributeManager({ 
  attrIndex, 
  control, 
  register, 
  watch, 
  setValue, 
  errors, 
  onRemove, 
  canRemove 
}: AttributeManagerProps) {
  const { fields: valueFields, append: appendValue, remove: removeValue } = useFieldArray({
    control,
    name: `attributes.${attrIndex}.values`,
  });

  const attributeType = watch(`attributes.${attrIndex}.type`);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Attribute {attrIndex + 1}
          </CardTitle>
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
                    const selectedType = TECH_ATTRIBUTE_TYPES.find(type => type.value === value);
                    if (selectedType) {
                      setValue(`attributes.${attrIndex}.name`, selectedType.label);
                    }
                  }} 
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select attribute type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TECH_ATTRIBUTE_TYPES
                      .filter((type) => type.value && type.value.trim() !== "")
                      .map((type) => (
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
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
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
  canRemove 
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
                  setValue(`attributes.${attrIndex}.values.${valueIndex}.value`, convertedValue);
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
                {...register(`attributes.${attrIndex}.values.${valueIndex}.colorCode`)}
                placeholder="#000000"
              />
              <div
                className="w-10 h-10 border border-gray-300 rounded"
                style={{
                  backgroundColor: watch(`attributes.${attrIndex}.values.${valueIndex}.colorCode`) || "#ffffff",
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
                const currentImages = watch(`attributes.${attrIndex}.values.${valueIndex}.images`) || [];
                setValue(`attributes.${attrIndex}.values.${valueIndex}.images`, [
                  ...currentImages,
                  ...files,
                ]);
              }}
            />

            <div className="grid grid-cols-4 gap-2">
              {watch(`attributes.${attrIndex}.values.${valueIndex}.images`)?.map(
                (file: File, imageIndex: number) => (
                  <div key={imageIndex} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Color ${valueIndex + 1} image ${imageIndex + 1}`}
                      className="w-full h-16 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        const currentImages = watch(`attributes.${attrIndex}.values.${valueIndex}.images`) || [];
                        const updatedImages = currentImages.filter(
                          (_: File, i: number) => i !== imageIndex
                        );
                        setValue(`attributes.${attrIndex}.values.${valueIndex}.images`, updatedImages);
                      }}
                      variant="destructive"
                      size="sm"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Variant Creator Component
function VariantCreator({ attributes, onAddVariant }: VariantCreatorProps) {
  const [selections, setSelections] = React.useState<{[key: string]: string}>({});
  const [price, setPrice] = React.useState("");
  const [stock, setStock] = React.useState("");

  const handleAddVariant = () => {
    if (Object.keys(selections).length === 0 || !price || !stock) {
      toast.error("Please select attributes, set price and stock");
      return;
    }

    const variant = {
      ...selections,
      price: price,
      stock: stock
    };

    onAddVariant(variant);
    toast.success("Variant added successfully");
    setSelections({});
    setPrice("");
    setStock("");
  };

  const getAttributeLabel = (attrType: string, value: string) => {
    const attribute = attributes.find((attr: any) => attr.type === attrType);
    if (attribute) {
      const attrValue = attribute.values.find((val: any) => val.value === value);
      return attrValue ? attrValue.label : value;
    }
    return value;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Variant</CardTitle>
        <p className="text-sm text-gray-600">
          Select attributes from your attribute pool to create a specific variant
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attributes
            .filter((attribute: any) => attribute.name && attribute.type)
            .map((attribute: any, index: number) => {
              const validValues = attribute.values?.filter((value: any) => 
                value.value && value.value.trim() !== ""
              ) || [];

              return (
                <div key={index} className="space-y-2">
                  <Label>{attribute.name}</Label>
                  <Select
                    value={selections[attribute.type] || ""}
                    onValueChange={(value) => {
                      setSelections(prev => ({
                        ...prev,
                        [attribute.type]: value
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
                        validValues.map((value: any, valueIndex: number) => (
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
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter variant price"
              min="0"
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

        {Object.keys(selections).length > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">Preview:</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(selections).map(([attrType, value]) => (
                <Badge key={attrType} variant="secondary">
                  {attrType}: {getAttributeLabel(attrType, value)}
                </Badge>
              ))}
              <Badge variant="outline">
                Stock: {stock || "0"}
              </Badge>
              <Badge variant="outline">
                Price: ৳{price ? parseInt(price).toLocaleString() : "0"}
              </Badge>
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
function VariantList({ variants, onEditVariant, onDeleteVariant, attributes }: VariantListProps) {
  const getAttributeLabel = (attrType: string, value: string) => {
    const attribute = attributes.find((attr: any) => attr.type === attrType);
    if (attribute) {
      const attrValue = attribute.values.find((val: any) => val.value === value);
      return attrValue ? attrValue.label : value;
    }
    return value;
  };

  const calculateVariantPrice = (variant: any) => {
    return parseFloat(variant.price || "0");
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
        <div className="space-y-3">
          {variants.map((variant: any, index: number) => (
            <div key={variant.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex flex-wrap gap-1 mb-2">
                  {Object.entries(variant).map(([key, value]) => {
                    if (key !== 'customPrice' && key !== 'stock' && key !== 'id' && value) {
                      return (
                        <Badge key={key} variant="secondary">
                          {key}: {getAttributeLabel(key, value as string)}
                        </Badge>
                      );
                    }
                    return null;
                  })}
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>Stock: {variant.stock}</span>
                  <span>Price: ৳{calculateVariantPrice(variant).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // For now, just show an edit dialog would go here
                    console.log("Edit variant", variant);
                  }}
                >
                  Edit
                </Button>
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
