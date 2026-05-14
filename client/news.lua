
RegisterNUICallback("callback", function(data, cb)
    TriggerServerEvent("ez_tablet:clientCallback", data.name, data.args)
    cb(true)
end)

-- =====================================================
-- RECEIVE DATA FROM SERVER → SEND TO NUI
-- =====================================================
RegisterNetEvent("ez_tablet:callbackResponse", function(payload)
    SendNUIMessage(payload)
end)