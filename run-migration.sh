#!/bin/bash

# =====================================================
# SEO & E-E-A-T Enhancement - Database Migration Script
# Wildland Fire Recovery Fund
# =====================================================

set -e  # Exit on error

echo "=========================================="
echo "SEO & E-E-A-T Database Migration"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI not found${NC}"
    echo "Install with: npm install -g supabase"
    echo "Or use Supabase Dashboard SQL Editor manually"
    exit 1
fi

echo -e "${YELLOW}⚠️  IMPORTANT: Please ensure you have backed up your database${NC}"
echo ""
read -p "Have you backed up your database? (yes/no): " backup_confirm

if [ "$backup_confirm" != "yes" ]; then
    echo -e "${RED}Aborting. Please backup your database first.${NC}"
    exit 1
fi

echo ""
echo "Starting migration..."
echo ""

# Run the migration
echo -e "${YELLOW}Running database migration...${NC}"

if supabase db push; then
    echo ""
    echo -e "${GREEN}✓ Migration completed successfully!${NC}"
    echo ""
    
    echo "Migration Summary:"
    echo "=================="
    echo "✓ Added 25+ new fields to posts table"
    echo "✓ Created status enum (draft/scheduled/published)"
    echo "✓ Added auto-update trigger for last_updated_at"
    echo "✓ Created 4 performance indexes"
    echo "✓ Updated RLS policies for security"
    echo "✓ Set sensible defaults for existing records"
    echo ""
    
    echo -e "${GREEN}Next Steps:${NC}"
    echo "1. Verify migration in Supabase Dashboard"
    echo "2. Test the enhanced editor at /#publish"
    echo "3. Create a test post with new fields"
    echo "4. Validate SEO with Google Rich Results Test"
    echo ""
    
    echo "Documentation:"
    echo "- SEO_EEAT_IMPLEMENTATION.md - Technical details"
    echo "- BLOG_EDITOR_QUICK_START.md - User guide"
    echo "- DEPLOYMENT_CHECKLIST.md - Complete checklist"
    echo ""
    
else
    echo ""
    echo -e "${RED}✗ Migration failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check Supabase CLI is logged in: supabase login"
    echo "2. Verify project is linked: supabase link"
    echo "3. Check migration file exists: supabase/migrations/003_enhance_seo_eeat_fields.sql"
    echo "4. Review error message above"
    echo ""
    echo "Alternative: Run migration manually"
    echo "1. Open Supabase Dashboard"
    echo "2. Navigate to SQL Editor"
    echo "3. Copy content from: supabase/migrations/003_enhance_seo_eeat_fields.sql"
    echo "4. Paste and run"
    echo ""
    exit 1
fi

echo -e "${GREEN}=========================================="
echo "Migration Complete! 🎉"
echo "==========================================${NC}"
