update
    exit_velocity ev
set
    xwoba = surrounding.totalWoba / surrounding.totalAbs
from
    (select minMax.id, minMax.evMin, sum(lp.ab * lp.woba) as totalWoba, sum(lp.ab) as totalAbs
        from
            (select
                id,
                floor(hit_angle) - 2 as laMin,
                ceil(hit_angle) + 2 as laMax,
                floor(hit_speed) -2 as evMin,
                ceil(hit_speed) + 2 as evMax
                from exit_velocity)
            as minMax
        join
            league_performance as lp
        on
            minMax.laMin < lp.hit_angle and minMax.laMax > lp.hit_angle and minMax.evMin < lp.hit_speed and minMax.evMax > lp.hit_speed
        group by minMax.id, minMax.evMin)
    as surrounding
where ev.id = surrounding.id
;
