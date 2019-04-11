/**
 * 
 * @param avg The old average
 * @param volume the new volume (old volume + 1)
 * @param addOn the value of the new item
 */
export function averageOf(avg: number, volume: number, addOn: number) {
    volume = (volume > 1) ? volume : 2;
    let aggregate = avg * (volume - 1)
    // console.log(`init agg: ${aggregate}`)
    aggregate = parseFloat(`${aggregate}`) + parseFloat(`${addOn}`)
    let newAvg = aggregate / volume
  
    // if (isNaN(newAvg)) {
    //   console.log(`agg: ${aggregate}\nvol: ${volume}\nadd-on: ${addOn}\nnew-avg: ${newAvg}`)
    //   process.exit(0)
    // }
  
    return newAvg
  }