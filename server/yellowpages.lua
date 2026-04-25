print("[YELLOWPAGES] server loaded")

ESX = ESX or exports["es_extended"]:getSharedObject()

Config = Config or {}

lib.callback.register("ez_tablet:getYellowPages", function(source)

    local grouped = {}

    -- INIT CATEGORIES FROM CONFIG
    for _, cfg in pairs(Config.YellowPagesJobs or {}) do
        grouped[cfg.job] = {
            label = cfg.label,
            color = cfg.color,
            people = {}
        }
    end

    local xPlayers = ESX.GetExtendedPlayers()

    for _, xPlayer in pairs(xPlayers) do

        local job = xPlayer.getJob().name
        local identifier = xPlayer.getIdentifier()

        local category = grouped[job]

        if category then

            local result = MySQL.single.await([[
                SELECT firstname, lastname, phone_number
                FROM users
                WHERE identifier = ?
            ]], { identifier })

            if result then
                table.insert(category.people, {
                    name = (result.firstname or "") .. " " .. (result.lastname or ""),
                    phone = result.phone_number or "N/A"
                })
            end
        end
    end

    return grouped or {}
end)