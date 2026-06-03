alter table restaurants add column state text;

-- Backfill from existing city field
update restaurants set state =
  case
    when city ~* '(^|[\s,])WA([\s,]|$)' or city ilike '%western australia%' then 'WA'
    when city ~* '(^|[\s,])VIC([\s,]|$)' or city ilike '%victoria%' then 'VIC'
    when city ~* '(^|[\s,])NSW([\s,]|$)' or city ilike '%new south wales%' then 'NSW'
    when city ~* '(^|[\s,])QLD([\s,]|$)' or city ilike '%queensland%' then 'QLD'
    when city ~* '(^|[\s,])SA([\s,]|$)' or city ilike '%south australia%' then 'SA'
    when city ~* '(^|[\s,])TAS([\s,]|$)' or city ilike '%tasmania%' then 'TAS'
    when city ~* '(^|[\s,])ACT([\s,]|$)' or city ilike '%australian capital territory%' then 'ACT'
    when city ~* '(^|[\s,])NT([\s,]|$)' or city ilike '%northern territory%' then 'NT'
    else null
  end
where city is not null;
