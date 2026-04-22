local ESX = exports["es_extended"]:getSharedObject()

--====================================================
-- OPEN TABLET (COMMAND + ITEM USE SAME FLOW)
--====================================================
--RegisterNetEvent("ez_tablet:useTablet")
--AddEventHandler('ez_tablet:useTablet', function(data)
    
 --   local src = source

--    TriggerClientEvent("ez_tablet:open", src, {
 --       type = "open"
--    })
--end)

--====================================================
-- COMMAND OPEN (SAFE + RELIABLE)
--====================================================
RegisterNetEvent("ez_tablet:useTablet", function(data)
    local src = source

    print("[TABLET DEBUG] useTablet fired from:", src)

    TriggerClientEvent("ez_tablet:open", src)
end)