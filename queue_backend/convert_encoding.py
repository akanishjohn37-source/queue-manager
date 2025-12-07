
content = open('all_tables_schema.txt', 'r', encoding='utf-16le').read()
with open('all_tables_schema_utf8.txt', 'w', encoding='utf-8') as f:
    f.write(content)
