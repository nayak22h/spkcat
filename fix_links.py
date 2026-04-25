import os
import json

dir_path = 'c:/Users/nayak/Downloads/SpraytekWebsite/spkcat'
data_path = os.path.join(dir_path, 'Products', 'data.js')
json_path = os.path.join(dir_path, 'Products', 'products.json')

def main():
    with open(data_path, 'r', encoding='utf-8') as f:
        data_content = f.read()
        
    json_str = data_content.replace('window.productsData = ', '').strip()
    if json_str.endswith(';'):
        json_str = json_str[:-1]
        
    try:
        data_obj = json.loads(json_str)
    except Exception as e:
        print("Error parsing data.js", e)
        return

    products = data_obj.get('products', {})
    
    fixes = {
        "product118": "../path/to/Tek-Screed-20-C-new.pdf",
        "product119": "../path/to/Tek-Screed-30-C-new.pdf",
        "product120": "../path/to/Tek-Screed-40-C-new.pdf",
        "product121": "../path/to/Tek-Screed-50-C-new-2.pdf"
    }

    updated = False
    for prod_id, new_link in fixes.items():
        if prod_id in products:
            if products[prod_id].get('catalogLink') != new_link:
                print(f"Fixing {prod_id}: {products[prod_id].get('catalogLink')} -> {new_link}")
                products[prod_id]['catalogLink'] = new_link
                updated = True

    if updated:
        new_data_content = f"window.productsData = {json.dumps(data_obj, indent=4)};\n"
        with open(data_path, 'w', encoding='utf-8') as f:
            f.write(new_data_content)
            
        if os.path.exists(json_path):
            with open(json_path, 'w', encoding='utf-8') as f:
                f.write(json.dumps(data_obj, indent=4))
                
        print("\nSuccessfully fixed the broken catalog links!")
    else:
        print("\nLinks are already correct.")

if __name__ == '__main__':
    main()
