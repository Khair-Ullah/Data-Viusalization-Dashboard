from flask import Blueprint, request, jsonify
from database.db import get_db
import sqlite3

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/data')
def get_data():
    # Get filter parameters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    categories = request.args.getlist('category')   # multi-select
    regions = request.args.getlist('region')

    where_clauses = []
    params = []

    if start_date:
        where_clauses.append("date >= ?")
        params.append(start_date)
    if end_date:
        where_clauses.append("date <= ?")
        params.append(end_date)
    if categories:
        placeholders = ','.join('?' * len(categories))
        where_clauses.append(f"category IN ({placeholders})")
        params.extend(categories)
    if regions:
        placeholders = ','.join('?' * len(regions))
        where_clauses.append(f"region IN ({placeholders})")
        params.extend(regions)

    where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

    db = get_db()
    
    # 1. Time series (daily totals)
    time_query = f"""
        SELECT date, SUM(amount) as total
        FROM sales
        {where_sql}
        GROUP BY date
        ORDER BY date
    """
    time_rows = db.execute(time_query, params).fetchall()
    line_data = {
        'dates': [r['date'] for r in time_rows],
        'totals': [r['total'] for r in time_rows]
    }

    # 2. Category breakdown (bar)
    cat_query = f"""
        SELECT category, SUM(amount) as total
        FROM sales
        {where_sql}
        GROUP BY category
    """
    cat_rows = db.execute(cat_query, params).fetchall()
    bar_data = [{'category': r['category'], 'total': r['total']} for r in cat_rows]

    # 3. Region distribution (donut/pie)
    region_query = f"""
        SELECT region, SUM(amount) as total
        FROM sales
        {where_sql}
        GROUP BY region
    """
    region_rows = db.execute(region_query, params).fetchall()
    donut_data = [{'label': r['region'], 'value': r['total']} for r in region_rows]

    # 4. Scatter: quantity vs amount
    scatter_query = f"""
        SELECT amount, quantity
        FROM sales
        {where_sql}
    """
    scatter_rows = db.execute(scatter_query, params).fetchall()
    scatter_data = [{'amount': r['amount'], 'quantity': r['quantity']} for r in scatter_rows]

    # 5. Available filter options
    filters = {
        'categories': [r[0] for r in db.execute("SELECT DISTINCT category FROM sales").fetchall()],
        'regions': [r[0] for r in db.execute("SELECT DISTINCT region FROM sales").fetchall()],
        'dateRange': {
            'min': db.execute("SELECT MIN(date) FROM sales").fetchone()[0],
            'max': db.execute("SELECT MAX(date) FROM sales").fetchone()[0]
        }
    }

    return jsonify({
        'line': line_data,
        'bar': bar_data,
        'donut': donut_data,
        'scatter': scatter_data,
        'filters': filters
    })