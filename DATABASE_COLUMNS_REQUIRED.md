# Required Database Columns

## Table: public.tax_sim_optional_survey

The following columns must exist in the `tax_sim_optional_survey` table:

### Existing Columns
- `submission_id` (text/uuid) - Foreign key to tax_sim_submissions
- `age_band` (text)
- `gender` (text)
- `city` (text)
- `tenant_status` (text)
- `effectiveness_score` (integer)
- `trust_central_gov_score` (integer)
- `policy_priority` (text)
- `created_at` (timestamp)

### New Columns Added (Post-Results Feedback)
- `reaction_choice` (text) - User's sentiment about the simulation results
  - Possible values: "surprised", "expected", "too_much", "too_little", "unsure"
  - Nullable: Yes
  
- `simulation_feedback` (text) - Free-text feedback about the simulation
  - Max length: 300 characters (enforced in UI)
  - Nullable: Yes

## SQL Migration (if needed)

If these columns don't exist, run this SQL in your Supabase SQL Editor:

```sql
ALTER TABLE public.tax_sim_optional_survey
ADD COLUMN IF NOT EXISTS reaction_choice TEXT,
ADD COLUMN IF NOT EXISTS simulation_feedback TEXT;
```

## Notes
- Both new fields are optional and nullable
- The UI enforces a 300-character limit on `simulation_feedback`
- Empty values are saved as `null` in the database
- No validation is required on the backend for these fields
