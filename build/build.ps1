cd $PSScriptRoot\..\contracts
truffle compile
truffle migrate
cp $PSScriptRoot\contracts\TicketSale.json ..\web\TicketSale.json