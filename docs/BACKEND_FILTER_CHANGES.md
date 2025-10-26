# Backend API Changes for Filter Functionality

## Quick Summary for Backend Developer

### What Changed

1. **Filter Functionality**: The frontend now includes a filter on the "Assigned To" column that allows filtering leads by assigned users.
2. **Search Functionality**: The search box now needs to search across **Business Name**, **Email**, and **Mobile Number** fields.

### What You Need to Do

1. Add support for the `assigned_user_id` query parameter in the `GET /api/v1/lead` endpoint.
2. Update the existing `q` (search) parameter to search across business name, email, and mobile number fields.

---

## API Changes Required

### Endpoint

`GET /api/v1/lead`

### New Query Parameter

| Parameter          | Type   | Required | Description                                   |
| ------------------ | ------ | -------- | --------------------------------------------- |
| `q`                | string | No       | Search term for business name, email, mobile  |
| `assigned_user_id` | string | No       | Comma-separated list of user IDs to filter by |

### Example API Calls

```bash
# No filter (existing behavior - no changes needed)
GET /api/v1/lead?page=1&page_size=10

# Search by business name, email, or mobile
GET /api/v1/lead?page=1&page_size=10&q=techcorp
GET /api/v1/lead?page=1&page_size=10&q=john@example.com
GET /api/v1/lead?page=1&page_size=10&q=+919909094500

# Filter by single user
GET /api/v1/lead?page=1&page_size=10&assigned_user_id=0199cffd-5fb6-7c23-af24-3c02fd47fa00

# Filter by multiple users
GET /api/v1/lead?page=1&page_size=10&assigned_user_id=0199cffd-5fb6-7c23-af24-3c02fd47fa00,019abc12-def3-4567-8901-234567890abc

# Combined search and filter
GET /api/v1/lead?page=1&page_size=10&q=techcorp&assigned_user_id=0199cffd-5fb6-7c23-af24-3c02fd47fa00
```

---

## Implementation (FastAPI)

### Before

```python
@router.get("/lead")
async def get_leads(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    q: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Lead).filter(Lead.org_id == current_user.org_id)

    if q:
        # Old: Only searched one field
        query = query.filter(Lead.name.ilike(f"%{q}%"))

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [lead.to_dict() for lead in items],
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": (total + page_size - 1) // page_size
    }
```

### After (Updated Search + New Filter)

```python
from sqlalchemy import or_

@router.get("/lead")
async def get_leads(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    q: Optional[str] = None,
    assigned_user_id: Optional[str] = None,  # ← ADD THIS LINE
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Lead).filter(Lead.org_id == current_user.org_id)

    # ↓ UPDATE SEARCH TO CHECK MULTIPLE FIELDS
    if q:
        search_term = f"%{q}%"
        query = query.join(Lead.business).filter(
            or_(
                Business.business.ilike(search_term),  # Business name
                Business.email.ilike(search_term),     # Email
                Business.mobile.ilike(search_term)     # Mobile
            )
        )

    # ↓ ADD USER FILTER
    if assigned_user_id:
        user_ids = [uid.strip() for uid in assigned_user_id.split(",")]
        query = query.filter(Lead.assigned_to.in_(user_ids))

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [lead.to_dict() for lead in items],
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": (total + page_size - 1) // page_size
    }
```

---

## Implementation (Django)

```python
from django.db.models import Q

@api_view(['GET'])
def get_leads(request):
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 10))
    q = request.GET.get('q')
    assigned_user_id = request.GET.get('assigned_user_id')  # ← ADD THIS

    queryset = Lead.objects.filter(org_id=request.user.org_id)

    # ↓ UPDATE SEARCH TO CHECK MULTIPLE FIELDS
    if q:
        queryset = queryset.filter(
            Q(business__business__icontains=q) |     # Business name
            Q(business__email__icontains=q) |        # Email
            Q(business__mobile__icontains=q)         # Mobile
        )

    # ↓ ADD USER FILTER
    if assigned_user_id:
        user_ids = assigned_user_id.split(',')
        queryset = queryset.filter(assigned_to__in=user_ids)

    # ... rest of existing code
```

---

## Implementation (Node.js/Express)

```javascript
router.get("/lead", async (req, res) => {
  const { page = 1, page_size = 10, q, assigned_user_id } = req.query;

  let query = { org_id: req.user.org_id };

  // ↓ UPDATE SEARCH TO CHECK MULTIPLE FIELDS
  if (q) {
    query.$or = [
      { "business.business": { $regex: q, $options: "i" } }, // Business name
      { "business.email": { $regex: q, $options: "i" } }, // Email
      { "business.mobile": { $regex: q, $options: "i" } }, // Mobile
    ];
  }

  // ↓ ADD USER FILTER
  if (assigned_user_id) {
    const userIds = assigned_user_id.split(",");
    query.assigned_to = { $in: userIds };
  }

  // ... rest of existing code
});
```

---

## Testing Checklist

### ✅ Test Cases

1. **No Filter** - Should return all leads (existing behavior)

   ```bash
   curl "http://localhost:8000/api/v1/lead?page=1&page_size=10"
   ```

2. **Single User Filter** - Should return only leads assigned to that user

   ```bash
   curl "http://localhost:8000/api/v1/lead?page=1&page_size=10&assigned_user_id=USER_ID_HERE"
   ```

3. **Multiple Users Filter** - Should return leads assigned to any of the specified users

   ```bash
   curl "http://localhost:8000/api/v1/lead?page=1&page_size=10&assigned_user_id=USER_ID_1,USER_ID_2"
   ```

4. **Combined with Search** - Should apply both filters

   ```bash
   curl "http://localhost:8000/api/v1/lead?page=1&page_size=10&q=techcorp&assigned_user_id=USER_ID"
   ```

5. **Empty Result** - Should return empty items array if no matches
   ```bash
   # Use a non-existent user ID
   curl "http://localhost:8000/api/v1/lead?page=1&page_size=10&assigned_user_id=00000000-0000-0000-0000-000000000000"
   ```

### ✅ Expected Response Format

```json
{
  "items": [
    {
      "id": "019a1edb-851b-74e4-a886-5882aef590ee",
      "assigned_user": {
        "id": "0199cffd-5fb6-7c23-af24-3c02fd47fa00",
        "name": "Sagar"
      }
    }
  ],
  "page": 1,
  "page_size": 10,
  "total": 5,
  "total_pages": 1
}
```

---

## Notes

- ✅ **Backward Compatible**: If `assigned_user_id` is not provided, the endpoint works exactly as before
- ✅ **Minimal Changes**: Only 5-7 lines of code to add
- ✅ **Performance**: Uses database indexes on `assigned_to` column (ensure index exists!)
- ✅ **Security**: Already filtered by `org_id`, so users can only see leads in their organization

---

## Database Index (Important!)

For optimal performance, ensure there's an index on the `assigned_to` column:

```sql
-- PostgreSQL
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);

-- MySQL
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);

-- SQLite
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
```

---

## Questions?

If anything is unclear, refer to the full documentation in `docs/FILTER_IMPLEMENTATION.md` or contact the frontend team.

**Estimated Implementation Time**: 15-30 minutes

---

**Priority**: Medium  
**Complexity**: Low  
**Breaking Changes**: None
