import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function checkWinner(c1: number, c2: number) {
  if (win(c1, c2)) {
    return "player 1";
  } else if (win(c2, c1)) {
    return "player 2";
  }
  return "draw";
}

function win(c1: number, c2: number) {
  if (c1 === c2) {
    return false;
  } else if (c1 === 0) {
    return false;
  } else if (c1 % 2 === c2 % 2) {
    return c1 < c2;
  }
  return c1 > c2;
}

/**
 *     function solve(Move _c1, uint256 _salt) {
        require(_c1!=Move.Null); // J1 should have made a valid move.
        require(c2!=Move.Null); // J2 must have played.
        
        require(msg.sender==j1); // J1 can call this.
        require(keccak256(_c1,_salt)==c1Hash); // Verify the value is the commited one.
        
        // If j1 or j2 throws at fallback it won't get funds and that is his fault.
        // Despite what the warnings say, we should not use transfer as a throwing fallback would be able to block the contract, in case of tie.
        if (win(_c1,c2))
            j1.send(2*stake);
        else if (win(c2,_c1))
            j2.send(2*stake);
        else {
            j1.send(stake);
            j2.send(stake);
        }
        stake=0;
    }


        function win(Move _c1, Move _c2) constant returns (bool w) {
        if (_c1 == _c2)
            return false; // They played the same so no winner.
        else if (_c1==Move.Null)
            return false; // They did not play.
        else if (uint(_c1)%2==uint(_c2)%2) 
            return (_c1<_c2);
        else
            return (_c1>_c2);
    }
 */
