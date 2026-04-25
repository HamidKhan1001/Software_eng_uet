# Adding Team Member Photos

## Instructions

To add photos of the SE Society team members, follow these steps:

### 1. Photo Requirements
- **Format**: JPG, PNG, or WebP
- **Size**: Recommended 300x300px or larger
- **Quality**: High quality (min 150x150px)

### 2. Adding Photos

Place your photos in: `src/assets/members/`

The naming convention should match the member names in lowercase with hyphens:

```
src/assets/members/
├── malak-saad-khan.jpg
├── hamid-naeem.jpg
├── muhammad-adam.jpg
├── muhammad-umar.jpg
├── hammad-khan.jpg
├── waleed-khan.jpg
├── mustaqim-khan.jpg
├── zuhaib.jpg
├── muhammad-ahmad-mushtaq.jpg
├── abdul-samad.jpg
└── hamza-taif.jpg
```

### 3. Example Naming Pattern

- **Full Name**: `Malak Saad Khan` → `malak-saad-khan.jpg`
- **Full Name**: `Muhammad Ahmad Mushtaq` → `muhammad-ahmad-mushtaq.jpg`
- **Single Name**: `Zuhaib` → `zuhaib.jpg`

### 4. What Happens

- If a photo is found in the `src/assets/members/` folder with the matching name, it will be displayed
- If no photo is found, a default user icon will be shown
- Photos will be displayed in a circular frame (120x120px) on the homepage

### 5. Testing

After adding photos, the homepage will automatically load them. You don't need to restart the dev server unless you're getting caching issues. If photos don't show:
1. Clear your browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check file names match exactly (case-insensitive after conversion)

## Team Members List

1. Malak Saad Khan - President
2. Hamid Naeem - Vice President
3. Muhammad Adam - General Secretary
4. Muhammad Umar - General Manager
5. Hammad Khan - Industrial Liaison
6. Waleed Khan - Games & Dev Lead
7. Mustaqim Khan - Finance Manager
8. Zuhaib - Co-Manager
9. Muhammad Ahmad Mushtaq - Projector & Multimedia Head
10. Abdul Samad - Graphic Designer
11. Hamza Taif - Media Co-Lead
