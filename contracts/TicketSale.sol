pragma solidity ^0.4.4;

contract TicketSale {
    
    struct Ticket {
        uint concertId;
        uint id;
        address owner;
    }

    struct Concert {
        string bandName;
        uint totalTickets;
        uint soldTickets;
        address host;
    }

    mapping(uint => Concert) public concerts;

    uint uniqueTicketId;
    Ticket[] tickets;

    uint uniqueConcertId;

    function createConcert(string bandName, uint totalTickets) {
        //require()
        concerts[uniqueConcertId] = Concert({bandName: bandName, 
                                        totalTickets: totalTickets, 
                                        soldTickets: 0, 
                                        host: msg.sender});
        uniqueConcertId++;
    }

    function isConcertExist(uint concertId) returns(bool) {
        return concerts[concertId].totalTickets != 0;
    }

    function deleteConcert(uint concertId) {
        delete concerts[concertId];
    }

    function getConcertCount() returns(uint) {
        return uniqueConcertId;
    }

    function getConcertData(uint concertId) returns(string bandName, uint totalTickets, uint soldTickets) {
        require(isConcertExist(concertId));

        bandName = concerts[concertId].bandName;
        totalTickets = concerts[concertId].totalTickets;
        soldTickets = concerts[concertId].soldTickets;
        
        return (bandName, totalTickets, soldTickets); 
    }

    function sellTickets(uint concertId, uint count, address buyer) {
        //require(concerts[concertId].totalTickets != 0);
        //require((concerts[concertId].totalTickets) >= (concerts[concertId].soldTickets + count));

        // Reserve tickets
        concerts[concertId].soldTickets += count;

        // issue tickets
        for (uint i = 0; i < count; i++) {
            tickets.push(Ticket({concertId: concertId, id: uniqueTicketId, owner: buyer}));
            uniqueTicketId++;
        }
    }

    function hasTicket(uint concertId, address buyer) returns(bool) {
        for (uint i = 0; i < tickets.length; i++) {
            if ((tickets[i].concertId == concertId) && (tickets[i].owner == buyer)) {
                return true;
            }
        }
        return false;
    }

    function getTotalTicketsSold() returns(uint) {
        return tickets.length;
    }

    function getTotalTicketsByOwner(address buyer) returns(uint) {
        uint total = 0;
        for (uint i = 0; i < tickets.length; i++) {
            if (tickets[i].owner == buyer) {
                total++;
            }            
        }

        return total;               
    }
}