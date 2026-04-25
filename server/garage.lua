local ESX = exports.es_extended:getSharedObject()

lib.callback.register("ez_tablet:getGarageVehicles", function(source)

    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return {} end

    local identifier = xPlayer.identifier

    local result = MySQL.query.await([[
        SELECT plate, vehicle, stored, parking
        FROM owned_vehicles
        WHERE owner = ?
    ]], { identifier })

    if not result then return {} end

    local vehicles = {}

    for _, v in pairs(result) do

        local props = {}

        if v.vehicle and v.vehicle ~= "" then
            local ok, decoded = pcall(json.decode, v.vehicle)
            if ok and decoded then
                props = decoded
            end
        end

        -- =========================
        -- GARAGE CONFIG LOOKUP
        -- =========================
        local garageLabel = v.parking
        local coords = nil

        if Config.Garages and Config.Garages[v.parking] then
            garageLabel = Config.Garages[v.parking].label
            coords = Config.Garages[v.parking].coords
        end

        vehicles[#vehicles + 1] = {
            plate = v.plate,
            model = props.model or nil,
            status = (v.stored == 1) and "parked" or "out",

            garage = garageLabel,
            coords = coords
        }

    end

    return vehicles
end)