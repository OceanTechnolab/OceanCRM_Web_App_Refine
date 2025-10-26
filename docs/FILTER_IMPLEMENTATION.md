# Filter Implementation Guide

## Overview

This document describes the filter functionality implemented in the CRM application, specifically for filtering leads by assigned users. This follows Refine's best practices for table filtering and server-side data handling.

## Frontend Implementation

### Tech Stack

- **Framework**: Refine.dev with Ant Design
- **Table Component**: Ant Design Table with Refine's `useTable` hook
- **Filter Component**: Refine's `FilterDropdown` with Ant Design `Select`
- **Data Fetching**: Refine's `useSelect` hook for user data

### Implementation Details

#### 1. User Filter in Leads Table

**File**: `src/routes/leads/list/index.tsx`

The "Assigned To" column includes a filter dropdown that allows filtering leads by one or multiple assigned users.

```tsx
// Fetch users for filter dropdown
const { selectProps: userSelectProps } = useSelect({
  resource: "user",
  optionLabel: "name",
  optionValue: "id",
});

// Add filter to Assigned To column
<Table.Column
  dataIndex={["assigned_user", "id"]}
  title="Assigned To"
  filterIcon={<FilterOutlined />}
  filterDropdown={(props) => (
    <FilterDropdown {...props}>
      <Select
        {...userSelectProps}
        style={{ minWidth: 200 }}
        mode="multiple"
        placeholder="Select users"
      />
    </FilterDropdown>
  )}
  render={(_, record) => {
    const assigned_user = record.assigned_user;
    return (
      <Space>
        {assigned_user && (
          <>
            <CustomAvatar
              name={assigned_user?.name}
              src={assigned_user?.avatar}
            />
            <Text>{assigned_user?.name}</Text>
          </>
        )}
        {!assigned_user && <Text type="secondary">Unassigned</Text>}
      </Space>
    );
  }}
/>;
```

#### 2. Data Provider Configuration

**File**: `src/providers/data/index.ts`

The data provider transforms Refine's filter format into API query parameters.

```tsx
// Handle filters
if (filters) {
  filters.forEach((filter) => {
    if ("field" in filter && filter.value) {
      // Handle search filter (q parameter)
      if (filter.field === "q") {
        query.q = filter.value;
      }
      // Handle assigned_user filter
      else if (
        filter.field === "assigned_user" ||
        filter.field === "assigned_user.id"
      ) {
        // If multiple values, join them with comma
        if (Array.isArray(filter.value)) {
          query.assigned_user_id = filter.value.join(",");
        } else {
          query.assigned_user_id = filter.value;
        }
      }
    }
  });
}
```

### How It Works

1. **User Interaction**:
   - User clicks filter icon (🔍) on "Assigned To" column header
   - Dropdown opens showing searchable list of all users
   - User can select one or multiple users
   - User clicks "Filter" button

2. **Data Flow**:

   ```
   User Selection → Refine Filter State → Data Provider → API Request
   ```

3. **API Requests Generated**:
   - No filter: `GET /api/v1/lead?page=1&page_size=10`
   - Single user: `GET /api/v1/lead?page=1&page_size=10&assigned_user_id=019abc...`
   - Multiple users: `GET /api/v1/lead?page=1&page_size=10&assigned_user_id=019abc...,019def...,019ghi...`

---

## Backend Requirements

### API Endpoint Changes Required

**Endpoint**: `GET /api/v1/lead`

#### Current Parameters

```
- page: int (default: 1)
- page_size: int (default: 10)
- q: str (optional) - Search query for filtering by business name, contact person, etc.
```

#### New Parameter Required

```
- assigned_user_id: str (optional) - Comma-separated list of user IDs to filter by
```

### Implementation Example (FastAPI)

```python
from typing import Optional
from fastapi import APIRouter, Query

router = APIRouter()

@router.get("/lead")
async def get_leads(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    q: Optional[str] = None,
    assigned_user_id: Optional[str] = None,  # NEW PARAMETER
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get paginated list of leads with optional filters

    Args:
        page: Page number (1-indexed)
        page_size: Number of items per page
        q: Search query (searches business name, contact person, email, mobile)
        assigned_user_id: Comma-separated user IDs to filter by assigned user

    Returns:
        {
            "items": [...],
            "page": 1,
            "page_size": 10,
            "total": 100,
            "total_pages": 10
        }
    """
    # Start with base query
    query = db.query(Lead).filter(Lead.org_id == current_user.org_id)

    # Apply search filter
    if q:
        search_pattern = f"%{q}%"
        query = query.join(Business).filter(
            or_(
                Business.business.ilike(search_pattern),
                Business.name.ilike(search_pattern),
                Business.email.ilike(search_pattern),
                Business.mobile.ilike(search_pattern),
            )
        )

    # Apply assigned_user_id filter (NEW)
    if assigned_user_id:
        # Parse comma-separated user IDs
        user_ids = [uid.strip() for uid in assigned_user_id.split(",")]
        # Filter by assigned user
        query = query.filter(Lead.assigned_to.in_(user_ids))

    # Get total count before pagination
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()

    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size

    return {
        "items": [lead.to_dict() for lead in items],
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages
    }
```

### Django Example

```python
from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def get_leads(request):
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 10))
    q = request.GET.get('q')
    assigned_user_id = request.GET.get('assigned_user_id')  # NEW

    # Base queryset
    queryset = Lead.objects.filter(org_id=request.user.org_id)

    # Apply search filter
    if q:
        queryset = queryset.filter(
            Q(business__business__icontains=q) |
            Q(business__name__icontains=q) |
            Q(business__email__icontains=q) |
            Q(business__mobile__icontains=q)
        )

    # Apply assigned_user_id filter (NEW)
    if assigned_user_id:
        user_ids = assigned_user_id.split(',')
        queryset = queryset.filter(assigned_to__in=user_ids)

    # Get total and paginate
    total = queryset.count()
    offset = (page - 1) * page_size
    items = queryset[offset:offset + page_size]

    return Response({
        'items': [lead.to_dict() for lead in items],
        'page': page,
        'page_size': page_size,
        'total': total,
        'total_pages': (total + page_size - 1) // page_size
    })
```

### Database Schema Requirements

The filter assumes your Lead model has a relationship to User:

```python
class Lead(Base):
    __tablename__ = "leads"

    id = Column(String, primary_key=True)
    # ... other fields ...
    assigned_to = Column(String, ForeignKey("users.id"), nullable=True)

    # Relationship
    assigned_user = relationship("User", foreign_keys=[assigned_to])
```

### Response Format

The API should return leads with the assigned user information:

```json
{
  "items": [
    {
      "id": "019a1edb-851b-74e4-a886-5882aef590ee",
      "since": "2025-10-25T00:00:00",
      "stage": "Discussion",
      "potential": 50000,
      "business": {
        "id": "019a1edb-8518-7221-b32c-ce4511776ca8",
        "business": "TechCorp Solutions",
        "name": "John Smith",
        "email": "john@techcorp.com",
        "mobile": "+919909094500"
      },
      "assigned_user": {
        "id": "0199cffd-5fb6-7c23-af24-3c02fd47fa00",
        "name": "Sagar",
        "avatar": null
      },
      "product": null,
      "source": null
    }
  ],
  "page": 1,
  "page_size": 10,
  "total": 11,
  "total_pages": 2
}
```

---

## Testing

### Manual Testing Steps

1. **No Filter**:
   - Navigate to Leads page
   - Verify all leads are displayed
   - Check API call: `GET /api/v1/lead?page=1&page_size=10`

2. **Single User Filter**:
   - Click filter icon on "Assigned To" column
   - Select one user from dropdown
   - Click "Filter" button
   - Verify only leads assigned to that user are shown
   - Check API call includes: `&assigned_user_id=<user-id>`

3. **Multiple Users Filter**:
   - Click filter icon on "Assigned To" column
   - Select multiple users from dropdown
   - Click "Filter" button
   - Verify leads assigned to any of the selected users are shown
   - Check API call includes: `&assigned_user_id=<id1>,<id2>,<id3>`

4. **Clear Filter**:
   - Click filter icon
   - Click "Reset" button
   - Verify all leads are displayed again
   - Check API call no longer includes `assigned_user_id`

5. **Combine with Search**:
   - Use search bar to filter by business name
   - Apply assigned user filter
   - Verify both filters work together
   - Check API call includes both: `q=<search>&assigned_user_id=<ids>`

6. **Pagination with Filter**:
   - Apply assigned user filter
   - Navigate to page 2
   - Verify filter persists across pages
   - Check API call: `page=2&assigned_user_id=<ids>`

### Expected Behavior

- ✅ Filter dropdown shows all users in the organization
- ✅ Search works within the user dropdown
- ✅ Multiple users can be selected simultaneously
- ✅ Filter persists across page navigation
- ✅ Filter state is saved in URL query parameters
- ✅ Clearing filter resets to show all leads
- ✅ Filter icon shows "active" state when filter is applied
- ✅ Filter works in combination with search and pagination

---

## Refine Best Practices Applied

### 1. **Use `useTable` Hook**

Following Refine's core pattern for table management with built-in pagination, filtering, and sorting.

### 2. **Server-Side Filtering**

```tsx
pagination: {
  mode: "server",  // Let backend handle filtering
  pageSize: 10,
}
```

### 3. **FilterDropdown Component**

Using Refine's `FilterDropdown` component ensures consistent UI and behavior.

### 4. **useSelect for Relationships**

```tsx
const { selectProps: userSelectProps } = useSelect({
  resource: "user",
  optionLabel: "name",
  optionValue: "id",
});
```

Automatically handles fetching, caching, and populating the select dropdown.

### 5. **Nested DataIndex**

```tsx
dataIndex={["assigned_user", "id"]}
```

Properly references nested object fields for filtering.

### 6. **URL Sync**

```tsx
options={{
  syncWithLocation: true,  // Sync filters with URL
}}
```

Enables shareable filtered views and browser navigation.

### 7. **Resource-Based Architecture**

Following Refine's resource pattern where each entity (lead, user) is a separate resource with its own CRUD operations.

---

## Troubleshooting

### Filter Not Working

1. Check Network tab - is `assigned_user_id` parameter being sent?
2. Check backend logs - is the parameter being received?
3. Verify database query - is the filter being applied correctly?

### Dropdown Shows No Users

1. Check `/api/v1/user` endpoint is returning users
2. Verify user has permission to view users in their organization
3. Check console for errors in the `useSelect` hook

### Filter Clears on Page Refresh

1. Verify `syncWithLocation: true` is set in Refine options
2. Check browser console for routing errors

---

## Future Enhancements

### Potential Improvements

1. **Add "Unassigned" Option**: Filter for leads with no assigned user
2. **Stage Filter**: Add similar filter for lead stage
3. **Date Range Filter**: Filter leads by creation date or last updated date
4. **Product Filter**: Filter by associated product
5. **Source Filter**: Filter by lead source
6. **Save Filter Presets**: Allow users to save commonly used filter combinations

### Implementation Pattern

The same pattern can be applied to other columns:

```tsx
<Table.Column
  dataIndex={["field", "id"]}
  title="Column Name"
  filterIcon={<FilterOutlined />}
  filterDropdown={(props) => (
    <FilterDropdown {...props}>
      <Select
        {...selectPropsForResource}
        mode="multiple"
        placeholder="Select..."
      />
    </FilterDropdown>
  )}
/>
```

---

## Related Documentation

- [Refine Tables Guide](https://refine.dev/docs/guides-concepts/tables/)
- [Refine Filtering](https://refine.dev/docs/core/hooks/use-table/#filtering)
- [Ant Design Table Filters](https://ant.design/components/table#components-table-demo-custom-filter-panel)
- [Refine useSelect Hook](https://refine.dev/docs/ui-integrations/ant-design/hooks/use-select/)

---

## Support

For questions or issues with this implementation:

1. Check Refine Discord: https://discord.gg/refine
2. Refine Documentation: https://refine.dev/docs
3. Project Issues: [GitHub Repository Issues]

---

**Last Updated**: October 26, 2025
**Version**: 1.0
**Author**: Development Team
