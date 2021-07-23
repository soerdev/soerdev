function load_ver --on-variable="PWD"
  if not test -e .soerver; return; end

  test $theme_display_version_info != 'yes'; and return

  set -l current_ver (ver)
  test -z $current_ver; and return

  set -l yellow (set_color yellow)
  set -l normal (set_color normal)
  set -l next_ver (nextver)

  echo ""
  echo $yellow"Current project version ⇨"$normal $current_ver
  echo $yellow"   Next project version ⇨"$normal $next_ver
  echo ""
end
