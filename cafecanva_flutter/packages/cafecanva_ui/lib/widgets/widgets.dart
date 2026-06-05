import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import '../theme/app_theme.dart';

// --- CcCard ---
class CcCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color? color;
  final BorderSide? borderSide;
  final VoidCallback? onTap;

  const CcCard({
    Key? key,
    required this.child,
    this.padding = const EdgeInsets.all(CafeCanvaSpacing.lg),
    this.color,
    this.borderSide,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Widget content = Padding(
      padding: padding,
      child: child,
    );

    if (onTap != null) {
      content = InkWell(
        onTap: onTap,
        borderRadius: const BorderRadius.all(CafeCanvaRadius.lg),
        child: content,
      );
    }

    return Card(
      color: color,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: const BorderRadius.all(CafeCanvaRadius.lg),
        side: borderSide ?? BorderSide(color: CafeCanvaColors.stone200.withOpacity(0.8)),
      ),
      child: content,
    );
  }
}

// --- CcStatusBadge ---
class CcStatusBadge extends StatelessWidget {
  final String status;
  final bool isTable;

  const CcStatusBadge({
    Key? key,
    required this.status,
    this.isTable = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color textColor;
    String label = status.toUpperCase();

    if (isTable) {
      switch (status.toLowerCase()) {
        case 'available':
          bgColor = CafeCanvaColors.tableAvailable.withOpacity(0.1);
          textColor = CafeCanvaColors.tableAvailable;
          label = 'AVAILABLE';
          break;
        case 'occupied':
          bgColor = CafeCanvaColors.tableOccupied.withOpacity(0.1);
          textColor = CafeCanvaColors.tableOccupied;
          label = 'OCCUPIED';
          break;
        case 'reserved':
          bgColor = CafeCanvaColors.tableReserved.withOpacity(0.1);
          textColor = CafeCanvaColors.tableReserved;
          label = 'RESERVED';
          break;
        case 'cleaning':
          bgColor = CafeCanvaColors.tableCleaning.withOpacity(0.1);
          textColor = CafeCanvaColors.tableCleaning;
          label = 'CLEANING';
          break;
        default:
          bgColor = CafeCanvaColors.stone200;
          textColor = CafeCanvaColors.stone800;
      }
    } else {
      switch (status.toLowerCase()) {
        case 'pending':
          bgColor = CafeCanvaColors.orderPending.withOpacity(0.1);
          textColor = CafeCanvaColors.orderPending;
          break;
        case 'confirmed':
          bgColor = CafeCanvaColors.orderConfirmed.withOpacity(0.1);
          textColor = CafeCanvaColors.orderConfirmed;
          break;
        case 'preparing':
          bgColor = CafeCanvaColors.orderPreparing.withOpacity(0.1);
          textColor = CafeCanvaColors.orderPreparing;
          break;
        case 'ready':
          bgColor = CafeCanvaColors.orderReady.withOpacity(0.1);
          textColor = CafeCanvaColors.orderReady;
          break;
        case 'served':
          bgColor = CafeCanvaColors.orderServed.withOpacity(0.1);
          textColor = CafeCanvaColors.orderServed;
          break;
        case 'paid':
          bgColor = CafeCanvaColors.orderPaid.withOpacity(0.1);
          textColor = CafeCanvaColors.orderPaid;
          break;
        case 'cancelled':
          bgColor = CafeCanvaColors.orderCancelled.withOpacity(0.1);
          textColor = CafeCanvaColors.orderCancelled;
          break;
        default:
          bgColor = CafeCanvaColors.stone200;
          textColor = CafeCanvaColors.stone800;
      }
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 4.0),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: const BorderRadius.all(CafeCanvaRadius.full),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: textColor,
          fontSize: 11.0,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

// --- CcPriceText ---
class CcPriceText extends StatelessWidget {
  final int priceInPaise;
  final TextStyle? style;

  const CcPriceText({
    Key? key,
    required this.priceInPaise,
    this.style,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final double inRupees = priceInPaise / 100.0;
    return Text(
      '₹${inRupees.toStringAsFixed(2)}',
      style: style ?? const TextStyle(
        fontSize: 16.0,
        fontWeight: FontWeight.bold,
        color: CafeCanvaColors.stone800,
      ),
    );
  }
}

// --- CcMenuItemCard ---
class CcMenuItemCard extends StatelessWidget {
  final MenuItem item;
  final VoidCallback? onAdd;

  const CcMenuItemCard({
    Key? key,
    required this.item,
    this.onAdd,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CcCard(
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Item Image Section
          Expanded(
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(top: CafeCanvaRadius.lg),
              child: item.imageUrl != null
                  ? CachedNetworkImage(
                      imageUrl: item.imageUrl!,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: CafeCanvaColors.stone100,
                        child: const Center(child: CircularProgressIndicator(strokeWidth: 2)),
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: CafeCanvaColors.stone100,
                        child: const Icon(Icons.fastfood, color: CafeCanvaColors.stone400),
                      ),
                    )
                  : Container(
                      color: CafeCanvaColors.stone100,
                      child: const Icon(Icons.fastfood, size: 40.0, color: CafeCanvaColors.stone400),
                    ),
            ),
          ),
          // Details Section
          Padding(
            padding: const EdgeInsets.all(CafeCanvaSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14.0),
                ),
                const SizedBox(height: 4.0),
                if (item.description != null)
                  Text(
                    item.description!,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11.0, color: CafeCanvaColors.stone500),
                  ),
                const SizedBox(height: 8.0),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    CcPriceText(priceInPaise: item.price),
                    if (onAdd != null && item.status == 'available')
                      IconButton(
                        onPressed: onAdd,
                        icon: const Icon(Icons.add_circle, color: CafeCanvaColors.primary),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      )
                    else if (item.status != 'available')
                      const Text(
                        'UNAVAILABLE',
                        style: TextStyle(color: CafeCanvaColors.error, fontSize: 10.0, fontWeight: FontWeight.bold),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// --- CcTableCard ---
class CcTableCard extends StatelessWidget {
  final CafeTable table;
  final VoidCallback onTap;

  const CcTableCard({
    Key? key,
    required this.table,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color accentColor;
    switch (table.status.toLowerCase()) {
      case 'available':
        accentColor = CafeCanvaColors.tableAvailable;
        break;
      case 'occupied':
        accentColor = CafeCanvaColors.tableOccupied;
        break;
      case 'reserved':
        accentColor = CafeCanvaColors.tableReserved;
        break;
      case 'cleaning':
        accentColor = CafeCanvaColors.tableCleaning;
        break;
      default:
        accentColor = CafeCanvaColors.stone400;
    }

    return CcCard(
      onTap: onTap,
      padding: const EdgeInsets.all(CafeCanvaSpacing.md),
      borderSide: BorderSide(color: accentColor, width: 1.5),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            table.shape == 'round' ? Icons.circle : Icons.crop_square_rounded,
            size: 32.0,
            color: accentColor,
          ),
          const SizedBox(height: 8.0),
          Text(
            table.name,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16.0),
          ),
          const SizedBox(height: 4.0),
          Text(
            'Cap: ${table.capacity}',
            style: const TextStyle(fontSize: 12.0, color: CafeCanvaColors.stone500),
          ),
          const SizedBox(height: 8.0),
          CcStatusBadge(status: table.status, isTable: true),
        ],
      ),
    );
  }
}

// --- CcTabletScaffold ---
class CcTabletScaffold extends StatelessWidget {
  final Widget body;
  final List<Widget> sidebarItems;
  final Widget? bottomNavigationBar;
  final Widget? drawer;
  final String? title;

  const CcTabletScaffold({
    Key? key,
    required this.body,
    this.sidebarItems = const [],
    this.bottomNavigationBar,
    this.drawer,
    this.title,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final double screenWidth = MediaQuery.of(context).size.width;
    final bool isTablet = screenWidth >= 720;

    return Scaffold(
      appBar: title != null
          ? AppBar(
              title: Text(title!),
              leading: !isTablet && drawer != null
                  ? Builder(
                      builder: (context) => IconButton(
                        icon: const Icon(Icons.menu),
                        onPressed: () => Scaffold.of(context).openDrawer(),
                      ),
                    )
                  : null,
            )
          : null,
      drawer: !isTablet ? drawer : null,
      bottomNavigationBar: !isTablet ? bottomNavigationBar : null,
      body: Row(
        children: [
          if (isTablet && sidebarItems.isNotEmpty)
            Container(
              width: 240.0,
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(right: BorderSide(color: CafeCanvaColors.stone200)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo/Header space
                  Container(
                    padding: const EdgeInsets.all(CafeCanvaSpacing.xl),
                    child: Text(
                      'CafeCanva',
                      style: GoogleFonts.dmSans(
                        fontSize: 22.0,
                        fontWeight: FontWeight.w900,
                        color: CafeCanvaColors.primary,
                      ),
                    ),
                  ),
                  const Divider(height: 1),
                  Expanded(
                    child: ListView(
                      padding: const EdgeInsets.symmetric(vertical: CafeCanvaSpacing.md),
                      children: sidebarItems,
                    ),
                  ),
                ],
              ),
            ),
          Expanded(child: body),
        ],
      ),
    );
  }
}

// --- CcLoadingShimmer ---
class CcLoadingShimmer extends StatelessWidget {
  const CcLoadingShimmer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: CafeCanvaColors.stone200,
      highlightColor: CafeCanvaColors.stone100,
      child: GridView.builder(
        padding: const EdgeInsets.all(CafeCanvaSpacing.lg),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.8,
          crossAxisSpacing: CafeCanvaSpacing.lg,
          mainAxisSpacing: CafeCanvaSpacing.lg,
        ),
        itemCount: 6,
        itemBuilder: (context, index) => Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }
}

// --- CcEmptyState ---
class CcEmptyState extends StatelessWidget {
  final String title;
  final String description;
  final IconData icon;

  const CcEmptyState({
    Key? key,
    this.title = 'No details found',
    this.description = 'Try updating your filters or search fields.',
    this.icon = Icons.inbox,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(CafeCanvaSpacing.xxl),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 64.0, color: CafeCanvaColors.stone300),
          const SizedBox(height: 16.0),
          Text(
            title,
            style: const TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8.0),
          Text(
            description,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 14.0, color: CafeCanvaColors.stone500),
          ),
        ],
      ),
    );
  }
}

// --- CcErrorState ---
class CcErrorState extends StatelessWidget {
  final String error;
  final VoidCallback onRetry;

  const CcErrorState({
    Key? key,
    required this.error,
    required this.onRetry,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(CafeCanvaSpacing.xxl),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 64.0, color: CafeCanvaColors.error),
          const SizedBox(height: 16.0),
          const Text(
            'Something went wrong',
            style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8.0),
          Text(
            error,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 14.0, color: CafeCanvaColors.stone500),
          ),
          const SizedBox(height: 24.0),
          ElevatedButton(
            onPressed: onRetry,
            child: const Text('Try Again'),
          ),
        ],
      ),
    );
  }
}
