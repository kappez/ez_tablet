RegisterNUICallback("callback", function(data, cb)

    if not data or not data.name then
        cb({})
        return
    end

    -- =========================
    -- GARAGE VEHICLES (existing)
    -- =========================
    if data.name == "ez_tablet:getGarageVehicles" then

        local result = lib.callback.await("ez_tablet:getGarageVehicles", false)

        cb(result or {})
        return
    end

    -- =========================
    -- GPS WAYPOINT (FIX)
    -- =========================
    if data.name == "ez_tablet:garageSetWaypoint" then

        if data.args then
            SetNewWaypoint(data.args.x + 0.0, data.args.y + 0.0)
            print("[EZ_TABLET] GPS waypoint set:", data.args.x, data.args.y)
        end

        cb({ ok = true })
        return
    end

    cb({})
end)