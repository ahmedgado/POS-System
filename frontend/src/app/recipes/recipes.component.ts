import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService, Ingredient, Recipe, RecipeItem } from '../services/inventory.service';
import { Product, ProductService } from '../services/product.service';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="min-height:100vh;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <!-- Header -->
      <header style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);color:#d4af37;padding:20px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
        <div style="display:flex;align-items:center;justify-content:space-between;max-width:1600px;margin:0 auto;">
          <div>
            <h1 style="margin:0;font-size:24px;font-weight:700;">📜 Recipe Editor</h1>
            <p style="margin:4px 0 0 0;font-size:13px;color:#999;">{{ selectedProduct?.name || 'Select a product' }}</p>
          </div>
          <div style="display:flex;gap:12px;">
            <button (click)="router.navigate(['/app/products'])" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
              ← Back to Products
            </button>
            <button *ngIf="selectedProduct" (click)="saveRecipe()" [disabled]="saving" style="background:#fff;color:#DC3545;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
              {{ saving ? 'Saving...' : 'Save Recipe' }}
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main style="padding:32px;max-width:1200px;margin:0 auto;">
        <!-- Product Selector -->
        <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin-bottom:24px;">
          <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">Select Product</label>
          <select [(ngModel)]="selectedProductId" (change)="onProductChange()" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;">
            <option value="">Choose a product...</option>
            <option *ngFor="let p of products" [value]="p.id">{{ p.name }} ({{ p.category?.name }})</option>
          </select>
        </div>

        <!-- Recipe Editor -->
        <div *ngIf="selectedProduct" style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <!-- Cost Summary -->
          <div style="background:#F8F9FA;padding:16px;border-radius:8px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
            <div style="flex:1;">
              <div style="font-size:12px;color:#666;margin-bottom:4px;">Recipe Cost (will update Product Cost)</div>
              <div style="font-size:24px;font-weight:700;color:#28A745;">\${{ getTotalCost().toFixed(2) }}</div>
              <div style="font-size:11px;color:#999;margin-top:4px;">💡 This cost will be automatically saved to the product</div>
            </div>
            <div>
              <label style="display:block;font-size:12px;color:#666;margin-bottom:4px;">Servings/Yield</label>
              <input [(ngModel)]="recipe.servings" type="number" min="1" style="width:80px;padding:8px;border:1px solid #ddd;border-radius:6px;text-align:center;">
            </div>
          </div>

          <!-- Ingredients List -->
          <div style="margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <h3 style="margin:0;font-size:18px;font-weight:600;color:#333;">Ingredients</h3>
              <button (click)="addIngredient()" style="background:#DC3545;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;">
                + Add Ingredient
              </button>
            </div>

            <div *ngFor="let item of recipe.items; let i = index" style="display:flex;gap:12px;align-items:center;padding:12px;background:#F8F9FA;border-radius:8px;margin-bottom:8px;">
              <select [(ngModel)]="item.ingredientId" (change)="onIngredientChange(item)" style="flex:1;padding:8px;border:1px solid #ddd;border-radius:6px;">
                <option value="">Select ingredient...</option>
                <option *ngFor="let ing of ingredients" [value]="ing.id">
                  {{ ing.name }} ({{ ing.unit }}) - \${{ toNumber(ing.cost).toFixed(2) }}
                </option>
              </select>
              <input [(ngModel)]="item.quantity" type="number" step="0.01" placeholder="Qty" style="width:100px;padding:8px;border:1px solid #ddd;border-radius:6px;">
              <input [value]="item.unit" readonly placeholder="Unit" style="width:80px;padding:8px;border:1px solid #ddd;border-radius:6px;background:#f0f0f0;">
              <button (click)="removeIngredient(i)" style="background:#6C757D;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;">×</button>
            </div>

            <div *ngIf="recipe.items.length === 0" style="padding:40px;text-align:center;color:#666;border:2px dashed #ddd;border-radius:8px;">
              No ingredients added. Click "Add Ingredient" to start building the recipe.
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!selectedProduct" style="background:#fff;padding:60px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">🍽️</div>
          <h3 style="color:#333;margin-bottom:8px;">No Product Selected</h3>
          <p style="color:#666;">Select a product above to manage its recipe</p>
        </div>
      </main>
    </div>
  `,
  styles: [`
    input:focus, select:focus {
      outline: none;
      border-color: #DC3545;
      box-shadow: 0 0 0 3px rgba(220,53,69,0.1);
    }
    button:hover:not(:disabled) { opacity: 0.9; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class RecipesComponent implements OnInit {
  products: Product[] = [];
  ingredients: Ingredient[] = [];
  selectedProductId = '';
  selectedProduct: Product | null = null;
  recipe: Recipe = { id: '', productId: '', servings: 1, items: [] };
  saving = false;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private inventoryService: InventoryService,
    private productService: ProductService
  ) { }

  ngOnInit() {
    // Check for productId in query params first
    this.route.queryParams.subscribe(params => {
      if (params['productId']) {
        this.selectedProductId = params['productId'];
      }
    });

    // Load products and ingredients
    this.loadProducts();
    this.loadIngredients();
  }

  loadProducts() {
    this.productService.getAll().subscribe({
      next: (response) => {
        this.products = response.data || [];
        console.log('Products loaded:', this.products.length);

        // If we have a selectedProductId from query params, trigger the selection
        if (this.selectedProductId) {
          this.onProductChange();
        }
      },
      error: (err) => {
        console.error('Failed to load products', err);
        console.error('Error details:', err.error);
      }
    });
  }

  loadIngredients() {
    this.inventoryService.getIngredients().subscribe({
      next: (data) => this.ingredients = data || [],
      error: (err) => console.error('Failed to load ingredients', err)
    });
  }

  onProductChange() {
    if (!this.selectedProductId) {
      this.selectedProduct = null;
      return;
    }

    this.selectedProduct = this.products.find(p => p.id === this.selectedProductId) || null;

    if (this.selectedProduct) {
      this.inventoryService.getRecipe(this.selectedProductId).subscribe({
        next: (data) => {
          this.recipe = data || { id: '', productId: this.selectedProductId, servings: 1, items: [] };
        },
        error: () => {
          // No recipe exists yet, create empty one
          this.recipe = { id: '', productId: this.selectedProductId, servings: 1, items: [] };
        }
      });
    }
  }

  addIngredient() {
    this.recipe.items.push({
      ingredientId: '',
      quantity: 1,
      unit: ''
    });
  }

  removeIngredient(index: number) {
    this.recipe.items.splice(index, 1);
  }

  onIngredientChange(item: RecipeItem) {
    const ing = this.ingredients.find(i => i.id === item.ingredientId);
    if (ing) {
      item.unit = ing.unit;
    }
  }

  getTotalCost(): number {
    return this.recipe.items.reduce((sum, item) => {
      const ing = this.ingredients.find(i => i.id === item.ingredientId);
      return sum + (ing ? this.toNumber(ing.cost) * this.toNumber(item.quantity) : 0);
    }, 0);
  }

  toNumber(value: any): number {
    return Number(value || 0);
  }

  saveRecipe() {
    if (!this.selectedProductId) return;

    this.saving = true;
    this.inventoryService.updateRecipe(this.selectedProductId, this.recipe).subscribe({
      next: () => {
        this.saving = false;
        alert('✅ Recipe saved successfully!\n\n💰 Product cost has been automatically updated to $' + this.getTotalCost().toFixed(2));
      },
      error: (err) => {
        this.saving = false;
        alert('Failed to save recipe: ' + (err?.error?.message || 'Unknown error'));
      }
    });
  }
}
