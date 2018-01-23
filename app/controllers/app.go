package controllers

import (
	"fmt"
	"strconv"

	"github.com/Acidic9/go-steam/steamapi"
	"github.com/Acidic9/go-steam/steamid"
	"github.com/revel/revel"
	"github.com/xconstruct/go-pushbullet"
)

type App struct {
	*revel.Controller
}

func (c App) Index() revel.Result {
	return c.Render()
}

const SteamAPIKey = "E1FFB15B2C79FD99EFCE478B86B9E25A"

var (
	steamAPI = steamapi.NewKey(SteamAPIKey)
	pb       = pushbullet.New("o.7Z9oOvwsiXaJ9gVUNbvswJSitGFLUDLU")
)

type SearchResp struct {
	Success       bool `json:"success"`
	PlayerSummary *struct {
		steamapi.PlayerSummaries
		SteamLevel int `json:"steamLevel"`
		IDs        struct {
			ID   string `json:"id"`
			ID64 string `json:"id64"`
			ID32 uint32 `json:"id32"`
			ID3  string `json:"id3"`
		} `json:"ids"`
	} `json:"playerSummary,omitempty"`
	ResolvedVia *uint8 `json:"resolvedVia,omitempty"`
}

func (c App) APISearch(query string) revel.Result {
	var userFound bool

	id64, resolvedVia := steamid.ResolveID(query, SteamAPIKey)
	if id64.Uint64() != 0 {
		// Unsuccessful
		userFound = true
	}

	var summary struct {
		steamapi.PlayerSummaries
		SteamLevel int `json:"steamLevel"`
		IDs        struct {
			ID   string `json:"id"`
			ID64 string `json:"id64"`
			ID32 uint32 `json:"id32"`
			ID3  string `json:"id3"`
		} `json:"ids"`
	}

	if userFound {
		playerSummary, err := steamAPI.GetSinglePlayerSummaries(id64.Uint64())
		if err == nil {
			// Unsuccessful
			userFound = true
		}

		summary = struct {
			steamapi.PlayerSummaries
			SteamLevel int `json:"steamLevel"`
			IDs        struct {
				ID   string `json:"id"`
				ID64 string `json:"id64"`
				ID32 uint32 `json:"id32"`
				ID3  string `json:"id3"`
			} `json:"ids"`
		}{
			playerSummary,
			0,
			struct {
				ID   string `json:"id"`
				ID64 string `json:"id64"`
				ID32 uint32 `json:"id32"`
				ID3  string `json:"id3"`
			}{
				id64.ToID().String(),
				strconv.FormatUint(id64.Uint64(), 10),
				id64.To32().Uint32(),
				id64.To3().String(),
			},
		}

		steamLevel, _ := steamAPI.GetSteamLevel(id64.Uint64())
		summary.SteamLevel = steamLevel
	}

	go func() {
		// ipBlacklistStr, found := revel.Config.String("pushbullet.ip_blacklist")
		// if found {
		// 	for _, ip := range strings.Split(ipBlacklistStr, ", ") {
		// 		if c.ClientIP == ip {
		// 			return
		// 		}
		// 	}
		// }

		var userStr string
		if userFound {
			userStr = "user " + summary.PersonaName + " with SteamID " + summary.IDs.ID64
		} else {
			userStr = "no valid Steam user"
		}

		err := pb.PushNoteToChannel(
			"steamidlookup",
			"New Search Query: "+query,
			fmt.Sprintf("User searched for %s and found %s.",
				query,
				userStr,
			))
		if err != nil {
			revel.AppLog.Errorf("failed to send pushbullet note: %s", err.Error())
		}
	}()

	if !userFound {
		return c.RenderJSON(&SearchResp{false, nil, nil})
	}

	return c.RenderJSON(&SearchResp{true, &summary, &resolvedVia})
}
