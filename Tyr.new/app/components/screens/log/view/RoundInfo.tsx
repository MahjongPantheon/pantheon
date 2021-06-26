import React from 'react';


interface IRoundInfo {

}

/*interface IRoundInfo {
  winners: number[]
  losers: number[]
  tempaiPlayers: number[]
  paoPlayer?: number
  delta: number[]
  result: number[]
  outcome: string
  prevHonba: number
  prevRiichi: number
  riichiPlayers: number[]
  winnerHans: IHand[]
  wind: string
}*/


export const RoundInfo: React.FC = (props: IRoundInfo) => {


  return (
    <div className="page-log__info">
      hhjjhjh
    </div>
  )


  /* return (
     <div className="page-log__info">
       {round.outcome === OutcomeType.EXHAUSTIVE_DRAW && (
         <>
           Exhaustive draw
           {round.tempaiPlayers.length !== 0 && (
             <>
               <br/>
               Tempai: {this.getNames(round.tempaiPlayers)}
             </>
           )}
           {round.riichiPlayers.length !== 0 && (
             <>
               <br/>
               Riichi bets: {this.getNames(round.riichiPlayers)}
             </>
           )}
         </>
       )}
       {round.outcome === OutcomeType.ABORTIVE_DRAW && (
         <>
           Abortive draw
           {round.riichiPlayers.length !== 0 && (
             <>
               <br/>
               Riichi bets: {this.getNames(round.riichiPlayers)}
             </>
           )}
         </>
       )}
       {round.outcome === OutcomeType.CHOMBO && (
         <>
           Chombo
           {round.losers.length !== 0 && (
             <>
               <br/>
               Players: {this.getNames(round.losers)}
             </>
           )}
         </>
       )}
       {round.outcome === OutcomeType.NAGASHI && (
         <>
           Nagashi mangan
           {round.tempaiPlayers.length !== 0 && (
             <>
               <br/>
               Tempai: {this.getNames(round.tempaiPlayers)}
             </>
           )}
         </>
       )}
       {round.outcome === OutcomeType.RON && (
         <>
           Ron, {this.getHandAmount(round.winnerHans[0])}
           <br/>
           {`${this.getPlayerName(round.winners[0])} from ${this.getPlayerName(round.losers[0])}`}
           <br/>
           {round.winnerHans[0].yaku.join(', ')}
           {!!round.winnerHans[0].dora && <>, dora {round.winnerHans[0].dora}</>}
           <br/>
           {round.riichiPlayers.length !== 0 && (
             <>
               Riichi bets: {this.getNames(round.riichiPlayers)}
               {!!round.prevRiichi && <> + {round.prevRiichi}</>}
             </>
           )}
           {round.riichiPlayers.length === 0 && (
             <>
               Riichi bets: {round.prevRiichi}
             </>
           )}
           <br/>
           Honba: {round.prevHonba}
         </>
       )}
       {round.outcome === OutcomeType.TSUMO && (
         <>
           Tsumo, {this.getHandAmount(round.winnerHans[0])}
           <br/>
           {this.getPlayerName(round.winners[0])}
           <br/>
           {round.winnerHans[0].yaku.join(', ')}
           {!!round.winnerHans[0].dora && <>, dora {round.winnerHans[0].dora}</>}
           <br/>
           {round.riichiPlayers.length !== 0 && (
             <>
               Riichi bets: {this.getNames(round.riichiPlayers)}
               {!!round.prevRiichi && <> + {round.prevRiichi}</>}
             </>
           )}
           {round.riichiPlayers.length === 0 && (
             <>
               Riichi bets: {round.prevRiichi}
             </>
           )}
           <br/>
           Honba: {round.prevHonba}
         </>
       )}
       {round.outcome === OutcomeType.MULTIRON && (
         <>
           Multiron, from {this.getPlayerName(round.losers[0])}
           <br/>
           <br/>
           {round.winners.map((winner, i) => (
             <span key={i}>
                                 {this.getPlayerName(winner)}, {this.getHandAmount(round.winnerHans[i])}
               <br/>
               {round.winnerHans[i].yaku.join(', ')}
               {!!round.winnerHans[i].dora && <>, dora {round.winnerHans[i].dora}</>}
               <br/>
                                 <br/>
                             </span>
           ))}
           {round.riichiPlayers.length !== 0 && (
             <>
               Riichi bets: {this.getNames(round.riichiPlayers)}
               {!!round.prevRiichi && <> + {round.prevRiichi}</>}
             </>
           )}
           {round.riichiPlayers.length === 0 && (
             <>
               Riichi bets: {round.prevRiichi}
             </>
           )}
           <br/>
           Honba: {round.prevHonba}
         </>
       )}
     </div>
   )*/
}
