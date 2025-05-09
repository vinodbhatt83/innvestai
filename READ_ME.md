# InnVestAI - Hotel Investment Analytics Platform

InnVestAI is an AI-powered hotel investment analytics platform that helps investors make data-driven decisions for hotel acquisition, underwriting, and asset management.

## Overview

This project is a proof of concept (POC) for a hotel investment analytics platform that leverages AI to analyze hotel performance data, market trends, and investment opportunities. The platform provides:

- Deal creation and management
- Market trends analysis
- Property performance analysis
- Budget vs. actual comparison
- Department expense analysis
- Investment opportunity identification

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js (Next.js API routes)
- **Database**: PostgreSQL
- **Data Visualization**: Recharts
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/innvest-ai.git
cd innvest-ai
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env.local`
   - Update the values with your database credentials

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
innvest-ai/
├── components/          # Reusable UI components
│   ├── analytics/       # Analytics visualization components
│   ├── deals/           # Deal management components
│   └── ui/              # Generic UI components
├── lib/                 # Utility functions and API clients
│   ├── api/             # API client for interacting with backend
│   └── utils/           # Helper utilities
├── pages/               # Next.js pages
│   ├── api/             # API routes (backend)
│   ├── analytics/       # Analytics pages
│   └── deals/           # Deal management pages
├── public/              # Static assets
└── styles/              # Global styles
```

## Features

### Deal Management

- **Create Deal**: Create new investment deals with property information
- **List Deals**: View and filter all investment deals
- **Deal Details**: View comprehensive information about a specific deal

### Analytics

- **Market Trends**: Analyze RevPAR, ADR, and occupancy trends across different markets
- **Performance Analysis**: Track hotel performance metrics and department expenses
- **Market Comparison**: Compare performance across multiple markets
- **Investment Opportunities**: Identify potential investment opportunities based on market data

## API Routes

The application uses Next.js API routes to provide a backend for data operations:

### Deal APIs

- `GET /api/deals` - List all deals with pagination and filtering
- `POST /api/deals` - Create a new deal
- `GET /api/deals/:id` - Get details for a specific deal
- `PUT /api/deals/:id` - Update a deal
- `DELETE /api/deals/:id` - Delete a deal
- `GET /api/deals/search` - Search for properties when creating a deal

### Analytics APIs

- `GET /api/analytics/revenue` - Get monthly revenue analysis
- `GET /api/analytics/regional-performance` - Get performance by region
- `GET /api/analytics/department-expenses` - Get expenses by department
- `GET /api/analytics/market-trends` - Get market trends analysis
- `GET /api/analytics/market-comparison` - Get market comparison data
- `GET /api/analytics/market-dashboard` - Get market dashboard data

## Database Schema

The application uses a star schema with:

- Dimension tables (`dim_*`): Store attributes for properties, markets, etc.
- Fact tables (`fact_*`): Store metrics and measurements

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Hotel Business Intelligence System (HotelBIS) data model
- Recharts for data visualization
- Tailwind CSS for styling
