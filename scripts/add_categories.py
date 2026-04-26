import os
import json
import re

dir_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_js_path = os.path.join(dir_path, 'Products', 'data.js')
products_json_path = os.path.join(dir_path, 'Products', 'products.json')
index_html_path = os.path.join(dir_path, 'index.html')

def main():
    # 1. Load the existing data
    if not os.path.exists(products_json_path):
        print("Products JSON not found.")
        return
        
    with open(products_json_path, 'r', encoding='utf-8') as f:
        data_obj = json.load(f)
    
    products = data_obj.get('products', {})

    # 2. Parse index.html using regex
    if not os.path.exists(index_html_path):
        print("index.html not found.")
        return
        
    with open(index_html_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Split by categories
    cat_blocks = re.split(r'<div class="category">', html)[1:]
    
    mapping_count = 0
    
    for block in cat_blocks:
        # Extract category name
        h2_match = re.search(r'<h2>(.*?)</h2>', block, re.IGNORECASE)
        if not h2_match:
            continue
        category_name = h2_match.group(1).strip()
        category_name = re.sub(r'^\d+\.\s*', '', category_name)
        
        # Check for sub-subcategories (Flooring case)
        # We search for h3 followed by a div class="sub-subcategory"
        ssc_matches = re.finditer(r'<h3>(.*?)</h3>\s*<div class="sub-subcategory">(.*?)</div>', block, re.IGNORECASE | re.DOTALL)
        
        has_ssc = False
        for ssc in ssc_matches:
            has_ssc = True
            subcategory_name = ssc.group(1).strip()
            subcategory_name = re.sub(r'^[a-z]\.\s*', '', subcategory_name)
            ssc_block = ssc.group(2)
            
            links = re.findall(r'href="Products/prod\.html\?product=(product\d+)"', ssc_block)
            for prod_id in links:
                if prod_id in products:
                    products[prod_id]['category'] = category_name
                    products[prod_id]['subcategory'] = subcategory_name
                    mapping_count += 1
        
        if not has_ssc:
            # Look for subcategory div
            sub_match = re.search(r'<div class="subcategory">(.*?)</div>', block, re.IGNORECASE | re.DOTALL)
            if sub_match:
                sub_block = sub_match.group(1)
                links = re.findall(r'href="Products/prod\.html\?product=(product\d+)"', sub_block)
                for prod_id in links:
                    if prod_id in products:
                        products[prod_id]['category'] = category_name
                        mapping_count += 1

    # 3. Save the updated data
    data_obj['products'] = products
    
    # Save JSON
    with open(products_json_path, 'w', encoding='utf-8') as f:
        json.dump(data_obj, f, indent=4)
        
    # Save JS
    with open(data_js_path, 'w', encoding='utf-8') as f:
        f.write(f"window.productsData = {json.dumps(data_obj, indent=4)};\n")
        
    print(f"Successfully mapped {mapping_count} products to categories.")

if __name__ == '__main__':
    main()
