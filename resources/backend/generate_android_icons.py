#!/usr/bin/env python3
"""
Generate Android launcher icons from the haleemmedicose_logo.png
"""

import os
from PIL import Image, ImageOps

def create_android_icons():
    # Source logo path
    logo_path = "assets/haleemmedicose_logo.png"
    
    # Check if logo exists
    if not os.path.exists(logo_path):
        print(f"Error: Logo file {logo_path} not found!")
        return False
    
    # Load the logo
    try:
        logo = Image.open(logo_path)
        print(f"Original logo size: {logo.size}")
    except Exception as e:
        print(f"Error loading logo: {e}")
        return False
    
    # Android icon sizes
    icon_sizes = {
        'mdpi': 48,
        'hdpi': 72,
        'xhdpi': 96,
        'xxhdpi': 144,
        'xxxhdpi': 192
    }
    
    # Create icons directory
    icons_dir = "../haleem-medicose-frontend/android/app/src/main/res"
    
    # Generate icons for each density
    for density, size in icon_sizes.items():
        # Create mipmap directory
        mipmap_dir = os.path.join(icons_dir, f"mipmap-{density}")
        os.makedirs(mipmap_dir, exist_ok=True)
        
        # Resize logo to fit in the icon size (keeping aspect ratio)
        logo_resized = logo.copy()
        logo_resized.thumbnail((size, size), Image.Resampling.LANCZOS)
        
        # Create square canvas with white background
        icon = Image.new('RGBA', (size, size), (255, 255, 255, 0))
        
        # Center the logo on the canvas
        x = (size - logo_resized.width) // 2
        y = (size - logo_resized.height) // 2
        icon.paste(logo_resized, (x, y), logo_resized)
        
        # Save regular icon
        regular_path = os.path.join(mipmap_dir, "ic_launcher.png")
        icon.save(regular_path, "PNG")
        print(f"Created: {regular_path}")
        
        # Create round icon (same as regular for now)
        round_path = os.path.join(mipmap_dir, "ic_launcher_round.png")
        icon.save(round_path, "PNG")
        print(f"Created: {round_path}")
        
        # Create foreground webp version
        foreground_path = os.path.join(mipmap_dir, "ic_launcher_foreground.webp")
        icon.save(foreground_path, "WEBP")
        print(f"Created: {foreground_path}")
        
        # Create round foreground webp version
        round_foreground_path = os.path.join(mipmap_dir, "ic_launcher_round.webp")
        icon.save(round_foreground_path, "WEBP")
        print(f"Created: {round_foreground_path}")
    
    # Also create the playstore icon (512x512)
    playstore_dir = os.path.join(icons_dir)
    playstore_icon = logo.copy()
    playstore_icon.thumbnail((512, 512), Image.Resampling.LANCZOS)
    
    # Create square canvas for playstore
    playstore_square = Image.new('RGBA', (512, 512), (255, 255, 255, 0))
    x = (512 - playstore_icon.width) // 2
    y = (512 - playstore_icon.height) // 2
    playstore_square.paste(playstore_icon, (x, y), playstore_icon)
    
    playstore_path = os.path.join(playstore_dir, "ic_launcher-playstore.png")
    playstore_square.save(playstore_path, "PNG")
    print(f"Created: {playstore_path}")
    
    print("\n✅ All Android launcher icons generated successfully!")
    return True

if __name__ == "__main__":
    create_android_icons()