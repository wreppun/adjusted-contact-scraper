select combo.batter, count(combo.batter_name) as dupes
from (
  select distinct batter, batter_name
  from exit_velocity) as combo
group by combo.batter
order by dupes desc;
