import os
import json

dir_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_path = os.path.join(dir_path, 'Products', 'data.js')
json_path = os.path.join(dir_path, 'Products', 'products.json')

def clean_name(name):
    # Remove variations of " - new" and " - new 2"
    cleaned = name.replace(" - new 2", "").replace(" - new", "")
    return cleaned.strip()

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
    updated = False

    for key, product in products.items():
        original_name = product.get('name', '')
        new_name = clean_name(original_name)
        
        if new_name != original_name:
            print(f"Renamed: '{original_name}' -> '{new_name}'")
            product['name'] = new_name
            updated = True

    if updated:
        new_data_content = f"window.productsData = {json.dumps(data_obj, indent=4)};\n"
        with open(data_path, 'w', encoding='utf-8') as f:
            f.write(new_data_content)
            
        if os.path.exists(json_path):
            with open(json_path, 'w', encoding='utf-8') as f:
                f.write(json.dumps(data_obj, indent=4))
                
        print("\nSuccessfully updated product names!")
    else:
        print("\nNo names needed updating.")

if __name__ == '__main__':
    main()
