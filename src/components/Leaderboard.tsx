import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';

interface LeaderboardProps {
    leaderboardData: Array<{
    rank: number;
    token: string;
    mc: number;
    creator: string;
    launched: string;
    }>;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboardData }) => {
    return (
        <div className="leaderboard-container mb-6">
          <div className="p-4">
            <h1 className="leaderboard-title text-center mb-6">TKNZ LEADERBOARD</h1>
            
            <div className="flex justify-between mb-4">
              <div className="relative flex-1 mr-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-green/50 w-4 h-4" />
                <input 
                  type="text" 
                  className="search-field pl-10" 
                  placeholder="SEARCH TOKEN || CREATOR" 
                />
              </div>
              
              <button className="leaderboard-sort">
                <span>SORT BY: MC</span>
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
            
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>RANK</th>
                  <th>TOKEN</th>
                  <th>MC</th>
                  <th>CREATOR</th>
                  <th className="text-right">LAUNCHED</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((item) => (
                  <tr key={item.rank}>
                    <td className="text-cyber-green/70">#{item.rank}</td>
                    <td>{item.token}</td>
                    <td className="money">${item.mc.toFixed(2)} USD</td>
                    <td className="creator">{item.creator}</td>
                    <td className="time text-right">{item.launched}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    )
}