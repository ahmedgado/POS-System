#!/bin/bash
# Fix TypeScript strict return errors by adding Promise<void> return type

for file in src/controllers/floor.controller.ts src/controllers/table.controller.ts src/controllers/modifier.controller.ts src/controllers/kitchen.controller.ts; do
  # Replace async function signatures that don't have Promise<void> return type
  sed -i '' 's/export const \(.*\) = async (req: Request, res: Response)/export const \1 = async (req: Request, res: Response): Promise<void>/g' "$file"
done

echo "Fixed TypeScript return types"
