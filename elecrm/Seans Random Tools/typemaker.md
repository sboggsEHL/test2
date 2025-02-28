import json

def parse_property_type(property_details):
    """Convert JSON Schema type to TypeScript type."""
    ts_type = "any"  # Default type
    if "type" in property_details:
        types = property_details["type"]
        if isinstance(types, list):
            ts_type = " | ".join("null" if t == "null" else t for t in types)
        else:
            ts_type = types
        ts_type = ts_type.replace("integer", "number").replace("array", "any[]")
    elif "$ref" in property_details:
        ts_type = property_details["$ref"].split("/")[-1]
    return ts_type

def generate_typescript_interface(name, definition):
    """Generate TypeScript interface for a given schema definition."""
    interface_lines = [f"interface {name} {{"]
    if "properties" in definition:
        for prop, details in definition["properties"].items():
            ts_type = parse_property_type(details)
            interface_lines.append(f"  {prop}: {ts_type};")
    interface_lines.append("}")
    return "\n".join(interface_lines)

def main():
    input_file = "loan_schema.json"  # Path to your JSON file
    output_file = "loan_models.ts"

    # Load the JSON schema
    with open(input_file, "r") as f:
        data = json.load(f)

    # Extract definitions
    definitions = data.get("schema", {}).get("definitions", {})

    # Generate TypeScript interfaces
    ts_interfaces = []
    for name, definition in definitions.items():
        ts_interfaces.append(generate_typescript_interface(name, definition))

    # Save to output file
    with open(output_file, "w") as f:
        f.write("\n\n".join(ts_interfaces))

    print(f"TypeScript models saved to {output_file}")

if __name__ == "__main__":
    main()
