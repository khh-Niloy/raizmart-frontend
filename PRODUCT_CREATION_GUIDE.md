# 📱 How to Add a Product - Step-by-Step Guide

## Example: Adding iPhone 16 Pro Max

Let's walk through creating an iPhone 16 Pro Max with different colors, storage options, and regions.

---

## Step 1: Basic Product Information

### Product Information Section
```
Product Name: iPhone 16 Pro Max
Base Price: 99000 (৳99,000 BDT)
Brand: Apple (select from dropdown)
Description: (use rich text editor for product description)
```

### General Setup Section
```
Category: Mobile Phones (select from dropdown)
Sub Category: iPhone (select from dropdown)  
Search Tags: iphone, 16, pro, max, apple, smartphone
```

---

## Step 2: Product Attributes (The Key Part!)

This is where the magic happens. Instead of creating 36 individual variants, you define attributes and the system creates all combinations automatically.

### Attribute 1: Color
```
Click "Add Attribute" button

Attribute Name: Color
Attribute Type: Color (from dropdown)

Add Values:
Value 1:
  - Label: Space Black
  - Value: space-black
  - Color Code: #1d1d1f
  - Price Modifier: 0
  - Images: Upload 3-4 photos of black iPhone

Value 2:
  - Label: Natural Titanium  
  - Value: natural-titanium
  - Color Code: #f5f5dc
  - Price Modifier: 0
  - Images: Upload 3-4 photos of titanium iPhone

Value 3:
  - Label: White Titanium
  - Value: white-titanium
  - Color Code: #f8f8ff
  - Price Modifier: 0
  - Images: Upload 3-4 photos of white iPhone

Value 4:
  - Label: Desert Titanium
  - Value: desert-titanium
  - Color Code: #deb887
  - Price Modifier: 5000 (৳5,000 more)
  - Images: Upload 3-4 photos of desert iPhone
```

### Attribute 2: Storage
```
Click "Add Attribute" button again

Attribute Name: Storage
Attribute Type: Storage (from dropdown)

Add Values:
Value 1:
  - Label: 256GB
  - Value: 256gb
  - Price Modifier: 0 (this is the base storage)
  - (No color code or images needed for storage)

Value 2:
  - Label: 512GB
  - Value: 512gb
  - Price Modifier: 20000 (costs ৳20,000 more than base)

Value 3:
  - Label: 1TB
  - Value: 1tb
  - Price Modifier: 50000 (costs ৳50,000 more than base)
```

### Attribute 3: Region
```
Click "Add Attribute" button again

Attribute Name: Region
Attribute Type: Region (from dropdown)

Add Values:
Value 1:
  - Label: US
  - Value: us
  - Price Modifier: 0

Value 2:
  - Label: Europe
  - Value: eu
  - Price Modifier: 10000 (costs ৳10,000 more due to taxes)

Value 3:
  - Label: Asia
  - Value: asia
  - Price Modifier: 5000 (costs ৳5,000 more)
```

---

## Step 3: View Generated Variants

Click the "Show" button in the Variant Preview section to see what the system will create:

```
✅ Space Black + 256GB + US = ৳99,000
✅ Space Black + 256GB + Europe = ৳1,09,000  
✅ Space Black + 256GB + Asia = ৳1,04,000
✅ Space Black + 512GB + US = ৳1,19,000
✅ Space Black + 512GB + Europe = ৳1,29,000
✅ Space Black + 512GB + Asia = ৳1,24,000
... (and so on for all 36 combinations)
```

The system automatically:
- Creates all possible combinations (4 colors × 3 storage × 3 regions = 36 variants)
- Calculates prices (Base Price + sum of modifiers)
- Generates unique SKUs for each variant

---

## Step 4: Product Specifications

Add technical specifications that apply to ALL variants:

```
Click "Add Specification" button

Specification 1:
  - Key: Display
  - Value: 6.9-inch Super Retina XDR

Specification 2:
  - Key: Chip
  - Value: A18 Pro chip

Specification 3:
  - Key: Camera
  - Value: Pro camera system with 48MP Main

Specification 4:
  - Key: Battery
  - Value: Up to 33 hours video playback
```

---

## Step 5: Submit

Click "Create Product" button. The system will:
1. Create the product with your 3 attributes
2. Generate all 36 variants automatically
3. Upload images to each color variant
4. Set stock to 0 (you'll manage inventory later)

---

## 🎯 Key Concepts

### Base Price + Modifiers = Final Price
```
iPhone Example:
Base Price: ৳99,000
+ Desert Titanium: +৳5,000
+ 1TB Storage: +৳50,000  
+ Europe Region: +৳10,000
= Final Price: ৳1,64,000
```

### Attributes vs Variants
- **Attributes**: What you define (Color, Storage, Region)
- **Variants**: What customers buy (Space Black + 256GB + US)
- System creates variants automatically from attribute combinations

### Images are Tied to Colors
- Upload 3-4 images for each color
- Same images show for all storage/region combinations of that color
- When customer selects "Space Black", they see black iPhone photos

---

## 🚀 For Different Product Types

### Laptop Example:
```
Attributes:
1. Color: Silver, Space Gray, Gold
2. RAM: 8GB (+$0), 16GB (+$200), 32GB (+$800)  
3. Storage: 256GB (+$0), 512GB (+$200), 1TB (+$400)
4. Screen Size: 13-inch (+$0), 15-inch (+$300)
```

### Headphones Example:
```
Attributes:
1. Color: Black, White, Pink, Blue
2. Connectivity: Wired (+$0), Wireless (+$50)
3. Features: Standard (+$0), Noise Cancelling (+$100)
```

---

## ⚠️ Important Tips

1. **Start with Color**: Always create color attribute first since it has images
2. **Set Base Price Correctly**: Choose your cheapest variant as base price
3. **Use Price Modifiers**: Add cost differences for upgrades (storage, premium colors)
4. **Keep Values Simple**: Use lowercase with hyphens (space-black, 256gb)
5. **Preview Before Submit**: Always check the variant preview to ensure correct pricing

---

## 🎉 Result

Instead of manually creating 36 variants (which would take hours), you:
- Define 3 attributes in 10 minutes
- System generates all combinations automatically  
- Customers get Apple-like shopping experience
- You get easy inventory management

The customer will see:
```
[Color Selector] [Storage Selector] [Region Selector]
     ↓                ↓                ↓
 Space Black      →   256GB        →   US
 
Images change        Price updates     Final price
with color          with storage      calculated
selection           selection         automatically
```

Ready to try? Start with a simple product with 2 attributes first!